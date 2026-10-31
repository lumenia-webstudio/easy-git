import * as os from 'os';

const raw = process.env.ALLOWED_COMMANDS ?? 'git,npm,node,ls,cd,cat,mkdir,touch,echo,pwd,cp,mv,rm,clear,which,code';

const port = parseInt(process.env.PORT ?? '3001', 10);

export const config = {
  port,
  // Jamais exposé sur le réseau : le terminal est un vrai shell
  host: '127.0.0.1',
  // Jeton de session fourni par Electron à chaque lancement (absent en dev web)
  sessionToken: process.env.EASYGIT_TOKEN ?? '',
  allowedCommands: new Set(raw.split(',').map(s => s.trim()).filter(Boolean)),
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? `http://localhost:5173,http://127.0.0.1:${port}`).split(',').map(s => s.trim()),
  shell: process.env.SHELL ?? (os.platform() === 'win32' ? 'powershell.exe' : 'bash'),
  defaultCwd: process.env.DEFAULT_CWD ?? os.homedir(),
};
