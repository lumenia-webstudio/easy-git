import { Folder, GitBranch, Circle, Wifi, WifiOff, Loader } from 'lucide-react';
import type { TerminalStatus } from '../../hooks/useTerminalSocket';

export interface GitState {
  cwd: string;
  branch: string;
  dirty: boolean;
  changes: number;
  conflict: boolean;
}

interface StatusBarProps {
  gitState: GitState | null;
  connectionStatus: TerminalStatus;
  language: string;
}

export function StatusBar({ gitState, connectionStatus, language }: StatusBarProps) {
  const connectionColor =
    connectionStatus === 'connected' ? '#4ade80'
    : connectionStatus === 'connecting' ? '#fbbf24'
    : '#f87171';

  const connectionLabel =
    connectionStatus === 'connected' ? (language === 'fr' ? 'Connecté' : 'Connected')
    : connectionStatus === 'connecting' ? (language === 'fr' ? 'Connexion...' : 'Connecting...')
    : connectionStatus === 'error' ? (language === 'fr' ? 'Erreur' : 'Error')
    : (language === 'fr' ? 'Déconnecté' : 'Disconnected');

  const dirtyColor = !gitState ? '#334155'
    : gitState.conflict ? '#f87171'
    : gitState.dirty ? '#fbbf24'
    : '#4ade80';

  const dirtyLabel = !gitState ? ''
    : gitState.conflict
      ? (language === 'fr' ? '🔴 Conflits détectés' : '🔴 Conflicts detected')
    : gitState.dirty
      ? (language === 'fr' ? `🟡 ${gitState.changes} modification(s)` : `🟡 ${gitState.changes} change(s)`)
    : (language === 'fr' ? '✅ Aucun changement' : '✅ No changes');

  return (
    <div
      className="flex items-center gap-4 px-4 py-1.5 text-[11px] font-mono shrink-0 flex-wrap"
      style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
    >
      {/* Statut connexion */}
      <div className="flex items-center gap-1.5">
        {connectionStatus === 'connecting' ? (
          <Loader size={10} className="animate-spin" style={{ color: connectionColor }} />
        ) : connectionStatus === 'connected' ? (
          <Wifi size={10} style={{ color: connectionColor }} />
        ) : (
          <WifiOff size={10} style={{ color: connectionColor }} />
        )}
        <span style={{ color: connectionColor }}>{connectionLabel}</span>
      </div>

      {gitState && (
        <>
          <div className="w-px h-3" style={{ background: '#1e293b' }} />

          {/* Répertoire courant */}
          <div className="flex items-center gap-1.5">
            <Folder size={10} style={{ color: '#60a5fa' }} />
            <span style={{ color: '#94a3b8' }} title={gitState.cwd}>
              {gitState.cwd.length > 35
                ? '…' + gitState.cwd.slice(-32)
                : gitState.cwd}
            </span>
          </div>

          {/* Branche */}
          {gitState.branch && (
            <>
              <div className="w-px h-3" style={{ background: '#1e293b' }} />
              <div className="flex items-center gap-1.5">
                <GitBranch size={10} style={{ color: '#a78bfa' }} />
                <span style={{ color: '#a78bfa' }}>{gitState.branch}</span>
              </div>
            </>
          )}

          {/* État dirty */}
          <div className="w-px h-3" style={{ background: '#1e293b' }} />
          <div className="flex items-center gap-1.5">
            <Circle size={8} style={{ color: dirtyColor, fill: dirtyColor }} />
            <span style={{ color: dirtyColor }}>{dirtyLabel}</span>
          </div>
        </>
      )}
    </div>
  );
}
