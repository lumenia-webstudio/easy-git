import express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { execFile } from 'child_process';
import { timingSafeEqual } from 'crypto';
import { createPtySession } from './pty';
import { config } from './config';
import { GITHUB_CLIENT_ID, GITHUB_SCOPES } from '../src/config/github';

interface GitStateResult {
  cwd: string;
  branch: string;
  changes: number;
  dirty: boolean;
  conflict: boolean;
}

const CONFLICT_CODES = new Set(['UU', 'AA', 'DD', 'AU', 'UA', 'DU', 'UD']);

function pollGitState(pid: number): Promise<GitStateResult> {
  return new Promise((resolve) => {
    // Récupérer le CWD du processus PTY via /proc/<pid>/cwd (Linux)
    execFile('readlink', ['-f', `/proc/${pid}/cwd`], (err, cwdOut) => {
      const cwd = err ? process.env.HOME ?? '~' : cwdOut.trim();

      const getBranch = () => new Promise<string>((res) => {
        execFile('git', ['-C', cwd, 'branch', '--show-current'], (err, out) => {
          res(err ? '' : out.trim());
        });
      });

      const getStatus = () => new Promise<string[]>((res) => {
        execFile('git', ['-C', cwd, 'status', '--porcelain'], (err, out) => {
          if (err) { res([]); return; }
          res(out.split('\n').filter(l => l.trim()));
        });
      });

      Promise.all([getBranch(), getStatus()]).then(([branch, statusLines]) => {
        const changes = statusLines.length;
        const conflict = statusLines.some(l => CONFLICT_CODES.has(l.slice(0, 2)));
        resolve({ cwd, branch, changes, dirty: changes > 0, conflict });
      });
    });
  });
}

const app = express();
const server = http.createServer(app);

// En production : servir le build Vite
// On lit tous les fichiers en mémoire au démarrage pour éviter les problèmes de streaming
// sur le filesystem FUSE (SquashFS) de l'AppImage.
const distPath = process.env.APP_PATH
  ? path.join(process.env.APP_PATH, 'dist')
  : path.join(__dirname, '..', 'dist');

if (fs.existsSync(distPath)) {
  const MIME: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.png':  'image/png',
    '.webp': 'image/webp',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.json': 'application/json',
    '.woff2':'font/woff2',
    '.woff': 'font/woff',
    '.ttf':  'font/ttf',
  };

  // Charge récursivement tous les fichiers dans une Map en mémoire
  const staticFiles = new Map<string, { data: Buffer; mime: string }>();
  function loadDir(dir: string, base: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const urlPath  = base + '/' + entry.name;
      if (entry.isDirectory()) {
        loadDir(fullPath, urlPath);
      } else {
        const ext  = path.extname(entry.name).toLowerCase();
        const mime = MIME[ext] ?? 'application/octet-stream';
        staticFiles.set(urlPath, { data: fs.readFileSync(fullPath), mime });
      }
    }
  }
  loadDir(distPath, '');

  const indexEntry = staticFiles.get('/index.html');

  app.use((req, res, next) => {
    const entry = staticFiles.get(req.path);
    if (entry) {
      res.setHeader('Content-Type', entry.mime);
      res.setHeader('Content-Length', entry.data.length);
      res.end(entry.data);
    } else {
      next();
    }
  });

  app.get('/{*path}', (_req, res) => {
    if (indexEntry) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Length', indexEntry.data.length);
      res.end(indexEntry.data);
    } else {
      res.status(404).end('Not found');
    }
  });
}

// OAuth Device Flow : github.com/login/* refuse les appels navigateur (pas de CORS),
// le serveur local relaie. client_id, scope et grant_type sont fixés ici : pas de relais ouvert.
app.post('/api/oauth/:step', express.json(), async (req, res) => {
  const origin = req.headers.origin ?? '';
  if (!config.allowedOrigins.includes(origin) || !isTokenValid(req.get('x-easygit-token') ?? null)) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }

  let url: string;
  let body: Record<string, string>;
  if (req.params.step === 'device-code') {
    url = 'https://github.com/login/device/code';
    body = { client_id: GITHUB_CLIENT_ID, scope: GITHUB_SCOPES };
  } else if (req.params.step === 'access-token' && typeof req.body?.device_code === 'string') {
    url = 'https://github.com/login/oauth/access_token';
    body = {
      client_id: GITHUB_CLIENT_ID,
      device_code: req.body.device_code,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    };
  } else {
    res.status(400).json({ error: 'bad_request' });
    return;
  }

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    res.status(upstream.status).json(await upstream.json());
  } catch (err) {
    console.error('[OAuth] GitHub unreachable:', err);
    res.status(502).json({ error: 'network_error' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', allowedCommands: [...config.allowedCommands] });
});

function isTokenValid(candidate: string | null): boolean {
  if (!config.sessionToken) return true;
  if (!candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(config.sessionToken);
  return a.length === b.length && timingSafeEqual(a, b);
}

// WebSocket server
const wss = new WebSocketServer({ server, path: '/terminal' });

wss.on('connection', (ws: WebSocket, req) => {
  // Toujours vérifiés : bloque les pages web tierces (origine) et les autres clients (jeton)
  const origin = req.headers.origin ?? '';
  if (!config.allowedOrigins.includes(origin)) {
    ws.close(1008, 'Origin not allowed');
    return;
  }
  const token = new URL(req.url ?? '', 'http://localhost').searchParams.get('token');
  if (!isTokenValid(token)) {
    ws.close(1008, 'Invalid session token');
    return;
  }

  console.log(`[WS] New terminal connection from ${origin || 'unknown'}`);

  const session = createPtySession(80, 24);

  // PTY → WebSocket
  session.onData((data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'output', data }));
    }
  });

  session.onExit((code) => {
    console.log(`[PTY] Session exited with code ${code}`);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'exit', code }));
    }
  });

  // WebSocket → PTY
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'input' && typeof msg.data === 'string') {
        session.write(msg.data);
      } else if (msg.type === 'resize' && typeof msg.cols === 'number' && typeof msg.rows === 'number') {
        session.resize(msg.cols, msg.rows);
      } else if (msg.type === 'inject' && typeof msg.cmd === 'string') {
        session.write(msg.cmd + '\r');
        // Polling gitstate 900ms après l'injection (laisse le temps à la commande de se terminer)
        setTimeout(async () => {
          if (ws.readyState === WebSocket.OPEN) {
            const pid = session.getPid();
            const state = await pollGitState(pid);
            ws.send(JSON.stringify({ type: 'gitstate', ...state }));
          }
        }, 900);
      }
    } catch (err) {
      console.error('[WS] Failed to parse message:', err);
    }
  });

  ws.on('close', () => {
    console.log('[WS] Connection closed, killing PTY session');
    session.kill();
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err);
    session.kill();
  });
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Easy-Git Server] Port ${config.port} already in use by another program`);
  } else {
    console.error('[Easy-Git Server] Error:', err);
  }
  process.exit(1);
});

server.listen(config.port, config.host, () => {
  console.log(`[Easy-Git Server] Running on http://${config.host}:${config.port}`);
  console.log(`[Easy-Git Server] Allowed commands: ${[...config.allowedCommands].join(', ')}`);
});
