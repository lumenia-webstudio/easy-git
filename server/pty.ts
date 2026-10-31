import * as pty from 'node-pty';
import { config } from './config';

export interface PtySession {
  write: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  kill: () => void;
  onData: (cb: (data: string) => void) => void;
  onExit: (cb: (code: number) => void) => void;
  getPid: () => number;
}

/**
 * Vérifie si une ligne de commande est autorisée par la whitelist.
 * Les lignes vides, espaces, et builtins shell sont toujours OK.
 */
export function isCommandAllowed(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;

  // Extraire le premier mot (le nom de la commande)
  const cmd = trimmed.split(/[\s;|&]+/)[0].toLowerCase();

  // Builtins shell toujours autorisés
  const shellBuiltins = new Set(['cd', 'clear', 'exit', 'pwd', 'export', 'source', '.', 'alias', 'history', 'echo', 'which']);
  if (shellBuiltins.has(cmd)) return true;

  return config.allowedCommands.has(cmd);
}

/**
 * Crée une nouvelle session PTY.
 */
export function createPtySession(cols = 80, rows = 24): PtySession {
  const shell = config.shell;
  const cwd = config.defaultCwd;

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols,
    rows,
    cwd,
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
    } as Record<string, string>,
  });

  const dataListeners: Array<(data: string) => void> = [];
  const exitListeners: Array<(code: number) => void> = [];

  ptyProcess.onData((data) => {
    dataListeners.forEach(cb => cb(data));
  });

  ptyProcess.onExit(({ exitCode }) => {
    exitListeners.forEach(cb => cb(exitCode));
  });

  return {
    write(data: string) {
      // Vérifier la whitelist sur les lignes complètes (se terminant par \r ou \n)
      if (data.includes('\r') || data.includes('\n')) {
        const lines = data.split(/\r?\n/);
        for (const line of lines) {
          if (line.trim() && !isCommandAllowed(line)) {
            const msg = `\r\n\x1b[31m✗ Commande non autorisée: "${line.trim().split(/\s+/)[0]}"\x1b[0m\r\n`;
            dataListeners.forEach(cb => cb(msg));
            return;
          }
        }
      }
      ptyProcess.write(data);
    },

    resize(cols: number, rows: number) {
      try {
        ptyProcess.resize(cols, rows);
      } catch {
        // ignore resize errors
      }
    },

    kill() {
      try {
        ptyProcess.kill();
      } catch {
        // ignore kill errors
      }
    },

    onData(cb: (data: string) => void) {
      dataListeners.push(cb);
    },

    onExit(cb: (code: number) => void) {
      exitListeners.push(cb);
    },

    getPid() {
      return ptyProcess.pid ?? 0;
    },
  };
}
