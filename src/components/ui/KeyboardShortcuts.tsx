import { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
}

const groups: Array<{ title: string; shortcuts: Shortcut[] }> = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['G', 'D'], description: 'Aller au Dashboard' },
      { keys: ['G', 'R'], description: 'Aller aux Dépôts' },
      { keys: ['G', 'N'], description: 'Aller aux Notifications' },
      { keys: ['G', 'P'], description: 'Aller aux Pull Requests' },
      { keys: ['G', 'U'], description: 'Aller au Profil' },
      { keys: ['G', 'S'], description: 'Aller aux Paramètres' },
    ],
  },
  {
    title: 'Général',
    shortcuts: [
      { keys: ['?'], description: 'Afficher les raccourcis clavier' },
      { keys: ['Ctrl', '`'], description: 'Ouvrir / fermer le Terminal Git' },
      { keys: ['Esc'], description: 'Fermer les modales' },
    ],
  },
];

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(4,10,20,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 animate-in zoom-in-95 duration-150"
        style={{
          background: 'rgba(8,13,26,0.95)',
          border: '1px solid rgba(240,180,41,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(240,180,41,0.05)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(240,180,41,0.12)', color: '#f0b429' }}
            >
              <Keyboard size={14} />
            </div>
            <h2 className="text-sm font-semibold text-slate-100">Raccourcis clavier</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.title}>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest mb-2.5"
                style={{ color: 'rgba(240,180,41,0.5)' }}
              >
                {group.title}
              </p>
              <div className="space-y-1.5">
                {group.shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <span className="text-xs text-slate-400">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((key, ki) => (
                        <span key={ki}>
                          {ki > 0 && (
                            ['Ctrl', 'Alt', 'Shift', 'Meta', 'Cmd'].includes(s.keys[ki - 1])
                              ? <span className="text-slate-500 text-xs mx-0.5">+</span>
                              : <span className="text-slate-700 text-xs mx-0.5">then</span>
                          )}
                          <kbd
                            className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold"
                            style={{
                              background: 'rgba(240,180,41,0.1)',
                              color: '#f0b429',
                              border: '1px solid rgba(240,180,41,0.2)',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
                            }}
                          >
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-5 pt-4 text-center"
          style={{ borderTop: '1px solid rgba(240,180,41,0.08)' }}
        >
          <p className="text-xs text-slate-700">Appuyez sur <kbd className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>?</kbd> pour afficher ce panneau</p>
        </div>
      </div>
    </div>
  );
}
