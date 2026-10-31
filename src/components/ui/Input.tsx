import React from 'react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function Input({ label, hint, error, prefix, suffix, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-500 pointer-events-none">{prefix}</span>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-slate-800 border rounded-lg text-sm text-slate-100
            placeholder-slate-500 transition-colors
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-slate-600 hover:border-slate-500'}
            ${prefix ? 'pl-9' : 'pl-3'}
            ${suffix ? 'pr-9' : 'pr-3'}
            py-2
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-500 pointer-events-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full bg-slate-800 border rounded-lg text-sm text-slate-100
          placeholder-slate-500 transition-colors resize-none
          focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-slate-600 hover:border-slate-500'}
          px-3 py-2
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
