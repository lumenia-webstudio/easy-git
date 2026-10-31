import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'merged' | 'draft';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantClasses: Record<string, string> = {
  default: 'bg-slate-700 text-slate-300 border-slate-600',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  merged: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  draft: 'bg-slate-600/50 text-slate-400 border-slate-600',
};

const dotColors: Record<string, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-red-400',
  info: 'bg-sky-400',
  merged: 'bg-violet-400',
  draft: 'bg-slate-400',
};

export function Badge({ children, variant = 'default', size = 'sm', dot = false }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'}
        ${variantClasses[variant]}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}
