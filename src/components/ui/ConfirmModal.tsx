import { useState } from 'react';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { Button } from './Button';
import { useApp } from '../../context/AppContext';

export function ConfirmModal() {
  const { confirmOptions, confirmResolve, t } = useApp();
  const [typed, setTyped] = useState('');

  const options = confirmOptions;

  if (!options || !confirmResolve) return null;

  const severity = options.severity ?? 'warning';
  const required = options.requireTyping;
  const canConfirm = !required || typed === required;

  const handleConfirm = () => {
    if (!canConfirm) return;
    setTyped('');
    confirmResolve(true, typed || undefined);
  };

  const handleCancel = () => {
    setTyped('');
    confirmResolve(false);
  };

  const icons = {
    warning: <AlertTriangle size={22} className="text-amber-400" />,
    danger: <AlertOctagon size={22} className="text-red-400" />,
    info: <Info size={22} className="text-sky-400" />,
  };

  const headerBg = {
    warning: 'bg-amber-500/10 border-amber-500/20',
    danger: 'bg-red-500/10 border-red-500/20',
    info: 'bg-sky-500/10 border-sky-500/20',
  };

  const confirmVariant: Record<string, 'danger' | 'warning' | 'primary'> = {
    warning: 'warning',
    danger: 'danger',
    info: 'primary',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className={`flex items-start gap-3 px-5 py-4 border-b ${headerBg[severity]} rounded-t-xl`}>
          {icons[severity]}
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">{options.title}</h3>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">{options.message}</p>

          {required && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                {t('common.typeToConfirm', { value: required })}
              </p>
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && canConfirm) handleConfirm(); }}
                autoFocus
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                placeholder={required}
              />
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-700 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            {options.cancelLabel ?? t('common.cancel')}
          </Button>
          <Button
            variant={confirmVariant[severity]}
            size="sm"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {options.confirmLabel ?? t('common.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
