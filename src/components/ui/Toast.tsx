import type { ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Toast as ToastType } from '../../types';

const icons: Record<ToastType['type'], ReactNode> = {
  success: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={16} className="text-red-400 shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
  info: <Info size={16} className="text-sky-400 shrink-0" />,
};

const borderColors: Record<ToastType['type'], string> = {
  success: 'border-emerald-500/30',
  error: 'border-red-500/30',
  warning: 'border-amber-500/30',
  info: 'border-sky-500/30',
};

export function ToastContainer() {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: ToastType }) {
  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl
        bg-slate-800/95 backdrop-blur-sm border ${borderColors[toast.type]}
        shadow-lg shadow-slate-950/50
        animate-in slide-in-from-bottom-2 fade-in duration-200
      `}
    >
      {icons[toast.type]}
      <p className="text-sm text-slate-200 leading-snug flex-1">{toast.message}</p>
    </div>
  );
}
