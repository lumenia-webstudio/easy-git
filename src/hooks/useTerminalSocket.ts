import { useEffect, useRef, useCallback, useState } from 'react';

export type TerminalStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface GitStateMessage {
  cwd: string;
  branch: string;
  changes: number;
  dirty: boolean;
  conflict: boolean;
}

interface UseTerminalSocketOptions {
  onData: (data: string) => void;
  onStatusChange?: (status: TerminalStatus) => void;
  onGitState?: (state: GitStateMessage) => void;
}

export function useTerminalSocket({ onData, onStatusChange, onGitState }: UseTerminalSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<TerminalStatus>('disconnected');
  const onDataRef = useRef(onData);
  const onStatusChangeRef = useRef(onStatusChange);
  const onGitStateRef = useRef(onGitState);

  // Garder les callbacks à jour sans recréer la connexion
  useEffect(() => { onDataRef.current = onData; }, [onData]);
  useEffect(() => { onStatusChangeRef.current = onStatusChange; }, [onStatusChange]);
  useEffect(() => { onGitStateRef.current = onGitState; }, [onGitState]);

  const updateStatus = useCallback((s: TerminalStatus) => {
    setStatus(s);
    onStatusChangeRef.current?.(s);
  }, []);

  const connect = useCallback(() => {
    // Éviter les connexions multiples
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) return;

    updateStatus('connecting');

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // En dev Vite, le proxy /terminal redirige vers ws://localhost:3001/terminal
    const host = window.location.host;
    // Jeton fourni par le preload Electron ; vide en dev web
    const token = window.easyGit?.token ?? '';
    const query = token ? `?token=${encodeURIComponent(token)}` : '';
    const ws = new WebSocket(`${protocol}//${host}/terminal${query}`);

    ws.onopen = () => updateStatus('connected');

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        if (msg.type === 'output' && typeof msg.data === 'string') {
          onDataRef.current(msg.data);
        } else if (msg.type === 'gitstate') {
          onGitStateRef.current?.({
            cwd: msg.cwd ?? '',
            branch: msg.branch ?? '',
            changes: msg.changes ?? 0,
            dirty: msg.dirty ?? false,
            conflict: msg.conflict ?? false,
          });
        }
      } catch {
        onDataRef.current(event.data as string);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      updateStatus('disconnected');
    };

    ws.onerror = () => {
      updateStatus('error');
    };

    wsRef.current = ws;
  }, [updateStatus]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const sendInput = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'input', data }));
    }
  }, []);

  const sendResize = useCallback((cols: number, rows: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'resize', cols, rows }));
    }
  }, []);

  const injectCommand = useCallback((cmd: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'inject', cmd }));
    }
  }, []);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => { disconnect(); };
  }, [disconnect]);

  return { status, connect, disconnect, sendInput, sendResize, injectCommand };
}
