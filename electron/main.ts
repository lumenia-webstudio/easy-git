import { app, BrowserWindow, dialog, shell } from 'electron';
import * as path from 'path';
import * as http from 'http';
import * as fs from 'fs';
import { randomBytes } from 'crypto';
import { fork, spawn, ChildProcess } from 'child_process';

const LOG_FILE = '/tmp/easygit-debug.log';
function log(...args: unknown[]): void {
  const line = `[${new Date().toISOString()}] ${args.map(String).join(' ')}\n`;
  process.stdout.write(line);
  try { fs.appendFileSync(LOG_FILE, line); } catch { /* ignore */ }
}

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

const isDev = !app.isPackaged;
const BACKEND_PORT = 3001;
const DEV_VITE_URL = `http://localhost:5173`;
const PROD_URL = `http://127.0.0.1:${BACKEND_PORT}`;
// Jeton propre à ce lancement : seul le renderer de cette fenêtre peut ouvrir le terminal
const SESSION_TOKEN = randomBytes(32).toString('hex');

function killBackend(): void {
  if (backendProcess) {
    backendProcess.kill('SIGKILL');
    backendProcess = null;
  }
}

// Garantir le nettoyage même en cas de crash du process principal
process.on('exit', killBackend);
process.on('SIGTERM', () => { killBackend(); process.exit(0); });
process.on('SIGINT',  () => { killBackend(); process.exit(0); });

// Attendre que le backend réponde (poll toutes les 200ms, timeout 15s)
function waitForBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      // Backend mort avant d'être prêt (ex. port occupé) : ne pas parler à un autre programme
      if (backendProcess?.exitCode !== null) {
        reject(new Error(`Backend exited before being ready (port ${BACKEND_PORT} may be in use)`));
        return;
      }
      http.get(`${PROD_URL}/api/health`, (res) => {
        res.resume(); // libérer le socket
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };
    const retry = () => {
      if (Date.now() - start > 15_000) {
        reject(new Error('Backend did not start within 15s'));
        return;
      }
      setTimeout(check, 200);
    };
    check();
  });
}

function startBackend(): void {
  if (backendProcess) return; // éviter un double fork
  const appPath = app.getAppPath(); // peut pointer vers app.asar (archive virtuelle)
  // fork() nécessite un vrai chemin filesystem → on utilise le répertoire unpacked
  const unpackedPath = appPath.replace(/app\.asar$/, 'app.asar.unpacked');
  const serverPath = path.join(unpackedPath, 'dist-server', 'index.cjs');
  log('[startBackend] appPath:', appPath);
  log('[startBackend] unpackedPath:', unpackedPath);
  log('[startBackend] serverPath:', serverPath);
  log('[startBackend] serverExists:', String(fs.existsSync(serverPath)));
  backendProcess = fork(serverPath, [], {
    env: {
      ...process.env,
      PORT: String(BACKEND_PORT),
      APP_PATH: unpackedPath,
      EASYGIT_TOKEN: SESSION_TOKEN,
      // Désactive l'interception asar dans le process forké : le serveur accède au vrai filesystem
      ELECTRON_NO_ASAR: '1',
    },
    stdio: 'inherit',
  });
  backendProcess.on('error', (err) => {
    log('[Electron] Backend error:', err);
  });
  backendProcess.on('exit', (code) => {
    log('[Electron] Backend exited with code:', String(code));
  });
}

async function createWindow(): Promise<void> {
  log('[createWindow] isDev:', String(isDev));
  if (!isDev) {
    log('[createWindow] Starting backend...');
    startBackend();
    log('[createWindow] Waiting for backend...');
    await waitForBackend();
    log('[createWindow] Backend ready!');
  }

  const preloadPath = path.join(
    isDev ? __dirname : path.join(app.getAppPath(), 'dist-electron'),
    'preload.cjs'
  );

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Easy Git',
    icon: path.join(app.getAppPath(), 'assets', 'icon.png'),
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      additionalArguments: isDev ? [] : [`--easygit-token=${SESSION_TOKEN}`],
    },
  });

  const url = isDev ? DEV_VITE_URL : PROD_URL;
  log('[createWindow] Loading URL:', url);

  mainWindow.webContents.on('did-fail-load', (_e, errCode, errDesc, failedUrl) => {
    log('[renderer] did-fail-load', String(errCode), errDesc, failedUrl);
  });
  mainWindow.webContents.on('did-finish-load', () => {
    log('[renderer] did-finish-load OK');
  });
  mainWindow.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    log(`[renderer] console[${level}] ${message} (${sourceId}:${line})`);
  });
  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    log('[renderer] render-process-gone reason:', details.reason, 'exitCode:', String(details.exitCode));
  });

  await mainWindow.loadURL(url);
  log('[createWindow] loadURL done');

  // Ouvrir les liens externes dans le navigateur système
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Requis sur Linux : le sandbox SUID nécessite des droits root que l'AppImage ne peut pas avoir.
// appendSwitch ne suffit pas : le zygote des renderers démarre avant ce code et exige le flag
// sur la vraie ligne de commande, sinon fenêtre blanche (double-clic sur l'AppImage)
if (process.platform === 'linux' && app.isPackaged && !process.argv.includes('--no-sandbox')) {
  // app.relaunch passe par un relauncher situé dans le montage FUSE de l'AppImage, qui disparaît
  // à la sortie : on relance directement le fichier .AppImage dans un process détaché
  spawn(process.env.APPIMAGE ?? process.execPath, [...process.argv.slice(1), '--no-sandbox'], {
    detached: true,
    stdio: 'ignore',
  }).unref();
  app.exit(0);
}
app.commandLine.appendSwitch('no-sandbox');
log('[main] App starting, isDev:', String(isDev), 'isPackaged:', String(app.isPackaged));

app.whenReady().then(createWindow).catch((err) => {
  log('[main] Failed to create window:', String(err));
  dialog.showErrorBox(
    'Easy Git',
    `Easy Git n'a pas pu démarrer : le port ${BACKEND_PORT} est peut-être utilisé par un autre programme.\n\n${String(err)}`
  );
  killBackend();
  app.quit();
});

app.on('window-all-closed', () => {
  killBackend();
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
