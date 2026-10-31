import { useState } from 'react';
import {
  FolderPlus, Download, Activity, Plus, Save,
  Upload, ArrowDown, GitBranch, GitMerge, GitCommit,
  HelpCircle,
} from 'lucide-react';
import { QUICK_ACTIONS, type QuickAction } from './quickActions';
import { ArgModal } from './ArgModal';
import type { ArgModalConfig } from './ArgModal';

const ICON_MAP: Record<string, React.ReactNode> = {
  FolderPlus: <FolderPlus size={15} />,
  Download: <Download size={15} />,
  Activity: <Activity size={15} />,
  Plus: <Plus size={15} />,
  Save: <Save size={15} />,
  Upload: <Upload size={15} />,
  ArrowDown: <ArrowDown size={15} />,
  GitBranch: <GitBranch size={15} />,
  GitMerge: <GitMerge size={15} />,
  GitCommit: <GitCommit size={15} />,
};

interface ActionButtonProps {
  action: QuickAction;
  onCommand: (cmd: string) => void;
  onHelp: (section?: string) => void;
  disabled?: boolean;
}

function ActionButton({ action, onCommand, onHelp, disabled }: ActionButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    if (action.command) {
      onCommand(action.command);
    } else if (action.modal) {
      setModalOpen(true);
    }
  };

  const modalConfig: ArgModalConfig | undefined = action.modal
    ? { ...action.modal, icon: ICON_MAP[action.iconName] }
    : undefined;

  return (
    <>
      <div className="relative">
        <button
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all select-none group"
          style={{
            background: 'var(--bg-input, #1e293b)',
            border: '1px solid var(--border-color)',
            opacity: disabled ? 0.4 : 1,
            minWidth: '72px',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          onClick={handleClick}
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
          disabled={disabled}
          title={action.tooltip}
        >
          <div className="flex items-center gap-1">
            <span style={{ color: 'var(--gold)' }}>
              {ICON_MAP[action.iconName]}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onHelp(action.helpSection); }}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
              title={`Aide: ${action.label}`}
              type="button"
            >
              <HelpCircle size={9} />
            </button>
          </div>
          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {action.label}
          </span>
          <span className="text-[9px] text-center leading-tight" style={{ color: 'var(--text-muted)' }}>
            {action.sublabel}
          </span>
        </button>

        {/* Tooltip */}
        {tooltipVisible && !disabled && (
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 rounded-lg text-[11px] z-50 pointer-events-none"
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            <p className="font-semibold mb-0.5" style={{ color: '#e2e8f0' }}>{action.label}</p>
            <p>{action.tooltip}</p>
            {action.modal && (
              <p className="mt-1 text-[10px]" style={{ color: '#4ade80' }}>→ Ouvrira un formulaire</p>
            )}
          </div>
        )}
      </div>

      {modalOpen && modalConfig && (
        <ArgModal
          config={modalConfig}
          onConfirm={onCommand}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

interface QuickActionsBarProps {
  onCommand: (cmd: string) => void;
  onHelp: (section?: string) => void;
  disabled?: boolean;
  language: string;
}

export function QuickActionsBar({ onCommand, onHelp, disabled, language }: QuickActionsBarProps) {
  const row1 = QUICK_ACTIONS.slice(0, 5);
  const row2 = QUICK_ACTIONS.slice(5, 10);

  return (
    <div
      className="px-4 py-3 shrink-0"
      style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
        {language === 'fr' ? 'Actions rapides' : 'Quick Actions'}
      </p>
      <div className="flex flex-wrap gap-2 mb-2">
        {row1.map(action => (
          <ActionButton key={action.id} action={action} onCommand={onCommand} onHelp={onHelp} disabled={disabled} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {row2.map(action => (
          <ActionButton key={action.id} action={action} onCommand={onCommand} onHelp={onHelp} disabled={disabled} />
        ))}
      </div>
    </div>
  );
}
