import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

export interface XtermTerminalHandle {
  write: (data: string) => void;
  clear: () => void;
  focus: () => void;
  fit: () => void;
}

interface XtermTerminalProps {
  onInput: (data: string) => void;
  onResize: (cols: number, rows: number) => void;
  isDark?: boolean;
}

const DARK_THEME = {
  background: '#060d1a',
  foreground: '#e2e8f0',
  cursor: '#4ade80',
  cursorAccent: '#060d1a',
  black: '#1e293b', red: '#f87171', green: '#4ade80',
  yellow: '#fbbf24', blue: '#60a5fa', magenta: '#a78bfa',
  cyan: '#34d399', white: '#e2e8f0',
  brightBlack: '#334155', brightRed: '#fca5a5', brightGreen: '#86efac',
  brightYellow: '#fcd34d', brightBlue: '#93c5fd', brightMagenta: '#c4b5fd',
  brightCyan: '#6ee7b7', brightWhite: '#f8fafc',
  selectionBackground: '#1d4ed840',
};

const LIGHT_THEME = {
  background: '#f8fafc',
  foreground: '#0f172a',
  cursor: '#1d4ed8',
  cursorAccent: '#f8fafc',
  black: '#334155', red: '#dc2626', green: '#16a34a',
  yellow: '#d97706', blue: '#2563eb', magenta: '#7c3aed',
  cyan: '#0891b2', white: '#475569',
  brightBlack: '#64748b', brightRed: '#ef4444', brightGreen: '#22c55e',
  brightYellow: '#f59e0b', brightBlue: '#3b82f6', brightMagenta: '#8b5cf6',
  brightCyan: '#06b6d4', brightWhite: '#0f172a',
  selectionBackground: '#bfdbfe80',
};

export const XtermTerminal = forwardRef<XtermTerminalHandle, XtermTerminalProps>(
  ({ onInput, onResize, isDark }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const onInputRef = useRef(onInput);
    const onResizeRef = useRef(onResize);
    const isDarkRef = useRef(isDark ?? true);

    useEffect(() => { onInputRef.current = onInput; }, [onInput]);
    useEffect(() => { onResizeRef.current = onResize; }, [onResize]);

    useEffect(() => {
      isDarkRef.current = isDark ?? true;
      if (termRef.current) {
        termRef.current.options.theme = isDark !== false ? DARK_THEME : LIGHT_THEME;
        // Mettre à jour le background du conteneur aussi
        if (containerRef.current) {
          containerRef.current.style.background = isDark !== false ? '#060d1a' : '#f8fafc';
        }
      }
    }, [isDark]);

    useEffect(() => {
      if (!containerRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Menlo, monospace',
        theme: isDarkRef.current ? DARK_THEME : LIGHT_THEME,
        scrollback: 5000,
        allowTransparency: true,
      });

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      term.open(containerRef.current);

      // Fit après un léger délai pour que le DOM soit prêt
      setTimeout(() => {
        fitAddon.fit();
        onResizeRef.current(term.cols, term.rows);
      }, 50);

      term.onData((data) => onInputRef.current(data));
      term.onResize(({ cols, rows }) => onResizeRef.current(cols, rows));

      // Copier / coller pour débutants (xterm envoie sinon ^V et ^C bruts au shell)
      const copySelection = () => {
        const selection = term.getSelection();
        if (selection) {
          navigator.clipboard.writeText(selection).catch(() => { /* presse-papiers indisponible */ });
          term.clearSelection();
        }
      };
      term.attachCustomKeyEventHandler((e) => {
        if (!e.ctrlKey || e.altKey || e.metaKey) return true;
        const key = e.key.toLowerCase();
        // Ctrl+V / Ctrl+Shift+V : laisser passer le collage natif, que xterm traite (collage multi-ligne sûr)
        if (key === 'v') return false;
        if (key === 'c' && (e.shiftKey || term.hasSelection())) {
          if (e.type === 'keydown') copySelection();
          e.preventDefault();
          return false;
        }
        return true;
      });

      // Clic droit : copie la sélection, sinon colle
      const container = containerRef.current;
      const onContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        if (term.hasSelection()) {
          copySelection();
        } else {
          navigator.clipboard.readText()
            .then((text) => { if (text) term.paste(text); })
            .catch(() => { /* presse-papiers indisponible */ });
        }
        term.focus();
      };
      container.addEventListener('contextmenu', onContextMenu);

      termRef.current = term;
      fitAddonRef.current = fitAddon;

      // Observer les changements de taille du conteneur
      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
        container.removeEventListener('contextmenu', onContextMenu);
        term.dispose();
        termRef.current = null;
        fitAddonRef.current = null;
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useImperativeHandle(ref, () => ({
      write: (data: string) => termRef.current?.write(data),
      clear: () => termRef.current?.clear(),
      focus: () => termRef.current?.focus(),
      fit: () => fitAddonRef.current?.fit(),
    }));

    return (
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: isDark !== false ? '#060d1a' : '#f8fafc' }}
      />
    );
  }
);

XtermTerminal.displayName = 'XtermTerminal';
