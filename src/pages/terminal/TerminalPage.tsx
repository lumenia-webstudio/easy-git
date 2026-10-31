import { useRef, useCallback, useState, useEffect } from 'react';
import { Terminal, RefreshCw, Maximize2, MapIcon } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { useApp } from '../../context/AppContext';
import { XtermTerminal, type XtermTerminalHandle } from '../../components/terminal/XtermTerminal';
import { QuickActionsBar } from '../../components/terminal/QuickActionsBar';
import { StatusBar, type GitState } from '../../components/terminal/StatusBar';
import { OutputInterpreter } from '../../components/terminal/OutputInterpreter';
import { useTerminalSocket, type TerminalStatus } from '../../hooks/useTerminalSocket';
import { CommandPalette } from './CommandPalette';
import type { TerminalCommand } from './terminalCommands';
import { WorkflowPanel } from '../../components/terminal/WorkflowPanel';

export function TerminalPage() {
  const { language, navigate } = useApp();
  const termRef = useRef<XtermTerminalHandle>(null);
  const [connectionStatus, setConnectionStatus] = useState<TerminalStatus>('disconnected');
  const [gitState, setGitState] = useState<GitState | null>(null);
  const [lastOutput, setLastOutput] = useState('');
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const outputBufferRef = useRef('');
  const outputTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleData = useCallback((data: string) => {
    termRef.current?.write(data);
    // Accumuler pour l'interpréteur de sortie, reset après 1.2s d'inactivité
    outputBufferRef.current += data;
    clearTimeout(outputTimerRef.current);
    outputTimerRef.current = setTimeout(() => {
      setLastOutput(outputBufferRef.current);
      outputBufferRef.current = '';
    }, 1200);
  }, []);

  const { status, connect, disconnect, sendInput, sendResize, injectCommand } =
    useTerminalSocket({
      onData: handleData,
      onStatusChange: setConnectionStatus,
      onGitState: setGitState,
    });

  // Nettoyage du timer à la destruction
  useEffect(() => {
    return () => clearTimeout(outputTimerRef.current);
  }, []);

  const handleConnect = useCallback(() => {
    connect();
    setTimeout(() => termRef.current?.focus(), 400);
  }, [connect]);

  // Auto-connexion au montage
  useEffect(() => {
    handleConnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCommand = useCallback((cmd: string) => {
    if (status !== 'connected') {
      connect();
      setTimeout(() => injectCommand(cmd), 600);
    } else {
      injectCommand(cmd);
    }
    termRef.current?.focus();
    setCommandHistory(prev => {
      const without = prev.filter(c => c !== cmd);
      return [cmd, ...without].slice(0, 10);
    });
  }, [status, connect, injectCommand]);

  const handleHelp = useCallback((section?: string) => {
    navigate({ name: 'help', section });
  }, [navigate]);

  const handleRestart = useCallback(() => {
    disconnect();
    setTimeout(handleConnect, 300);
  }, [disconnect, handleConnect]);

  const isConnected = status === 'connected';
  const isDisconnected = status === 'error';
  const isLoading = status === 'connecting' || status === 'disconnected';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={language === 'fr' ? 'Terminal Git' : 'Git Terminal'}
        subtitle={language === 'fr'
          ? 'Terminal interactif avec actions rapides — prêt pour les débutants'
          : 'Interactive terminal with quick actions — beginner-ready'}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Barre de statut git + connexion */}
        <StatusBar
          gitState={gitState}
          connectionStatus={connectionStatus}
          language={language}
        />

        {/* Boutons d'action rapide */}
        <QuickActionsBar
          onCommand={handleCommand}
          onHelp={handleHelp}
          language={language}
        />

        {/* Interpréteur de sortie (bannière contextuelle) */}
        {lastOutput && (
          <OutputInterpreter
            output={lastOutput}
            onNavigate={(page) => navigate({ name: page as 'settings' })}
          />
        )}

        {/* Zone principale */}
        <div className="flex flex-1 gap-4 p-4 overflow-hidden min-h-0">
          {/* Terminal xterm.js */}
          <div
            className="flex flex-col flex-1 rounded-xl overflow-hidden min-h-0"
            style={{ border: '1px solid #1e293b' }}
          >
            {/* Barre titre macOS-style */}
            <div
              className="flex items-center justify-between px-4 py-2.5 shrink-0"
              style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22c55e' }} />
                </div>
                <span className="text-[10px] font-mono ml-2" style={{ color: '#334155' }}>
                  bash — git
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <>
                    <button
                      onClick={handleRestart}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors"
                      style={{ color: '#475569', background: '#1e293b' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#475569')}
                      title={language === 'fr' ? 'Redémarrer le terminal' : 'Restart terminal'}
                    >
                      <RefreshCw size={10} />
                    </button>
                    <button
                      onClick={() => termRef.current?.fit()}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors"
                      style={{ color: '#475569', background: '#1e293b' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#475569')}
                      title={language === 'fr' ? 'Ajuster la taille' : 'Fit terminal'}
                    >
                      <Maximize2 size={10} />
                    </button>
                    <button
                      onClick={() => setWorkflowOpen(w => !w)}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] transition-colors"
                      style={{
                        color: workflowOpen ? 'var(--gold)' : '#475569',
                        background: workflowOpen ? 'var(--gold-bg)' : '#1e293b',
                        border: workflowOpen ? '1px solid var(--gold-border)' : '1px solid transparent',
                      }}
                      title={language === 'fr' ? 'Workflows guidés' : 'Guided workflows'}
                      type="button"
                    >
                      <MapIcon size={10} />
                      <span>Workflows</span>
                    </button>
                  </>
                )}
                {isDisconnected && (
                  <button
                    onClick={handleConnect}
                    className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors"
                    style={{ background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}
                  >
                    <Terminal size={11} />
                    {language === 'fr' ? 'Connecter le terminal' : 'Connect terminal'}
                  </button>
                )}
              </div>
            </div>

            {/* Corps du terminal */}
            <div className="flex-1 min-h-0" style={{ background: '#060d1a' }}>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
                  <p className="text-xs font-mono" style={{ color: '#334155' }}>
                    {language === 'fr' ? 'Connexion au terminal...' : 'Connecting to terminal...'}
                  </p>
                </div>
              ) : isDisconnected ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Terminal size={40} style={{ color: '#1e293b' }} />
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1" style={{ color: '#475569' }}>
                      {language === 'fr' ? 'Terminal déconnecté' : 'Terminal disconnected'}
                    </p>
                    <p className="text-xs" style={{ color: '#334155' }}>
                      {language === 'fr'
                        ? 'Clique sur le bouton ci-dessous pour démarrer une session'
                        : 'Click the button below to start a session'}
                    </p>
                  </div>
                  <button
                    onClick={handleConnect}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                    style={{ background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}
                  >
                    <Terminal size={14} />
                    {language === 'fr' ? 'Démarrer le terminal' : 'Start terminal'}
                  </button>
                  <p className="text-xs text-center max-w-xs" style={{ color: '#f87171' }}>
                    {language === 'fr'
                      ? 'Erreur de connexion. Le serveur backend est-il démarré ? Lance npm run dev depuis le terminal système.'
                      : 'Connection error. Is the backend server running? Run npm run dev from your system terminal.'}
                  </p>
                </div>
              ) : (
                <XtermTerminal
                  ref={termRef}
                  onInput={sendInput}
                  onResize={sendResize}
                  // Zone terminal toujours sombre, comme son cadre et la palette de commandes
                  isDark
                />
              )}
            </div>
          </div>

          {/* Panel droit : WorkflowPanel ou CommandPalette */}
          <div className="w-72 shrink-0 overflow-y-auto">
            {workflowOpen ? (
              <WorkflowPanel
                onCommand={handleCommand}
                onClose={() => setWorkflowOpen(false)}
                lastOutput={lastOutput}
                language={language}
              />
            ) : (
              <CommandPalette
                language={language}
                onSelect={(cmd: TerminalCommand) => handleCommand(cmd.cmd)}
                history={commandHistory}
                onHistorySelect={handleCommand}
                gitState={gitState}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
