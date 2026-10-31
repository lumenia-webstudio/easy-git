import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-sky-500 hover:bg-sky-400 text-white border-transparent shadow-sm shadow-sky-500/20',
  secondary:
    'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-600 hover:border-slate-500',
  ghost:
    'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-slate-100 border-transparent',
  danger:
    'bg-red-600 hover:bg-red-500 text-white border-transparent shadow-sm shadow-red-500/20',
  warning:
    'bg-amber-500 hover:bg-amber-400 text-slate-900 border-transparent shadow-sm shadow-amber-500/20',
  success:
    'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent shadow-sm shadow-emerald-500/20',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-lg border
        transition-all duration-150 select-none whitespace-nowrap
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 12 : 14} />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
