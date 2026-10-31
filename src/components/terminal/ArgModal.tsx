import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Info } from 'lucide-react';

export interface ArgField {
  name: string;
  placeholder: string;
  hint: string;
  validate?: (v: string) => string | null;
  suggestions?: string[];
}

export interface ArgModalConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: ArgField[];
  buildCommand: (values: string[]) => string;
  example?: string;
}

interface ArgModalProps {
  config: ArgModalConfig;
  onConfirm: (cmd: string) => void;
  onClose: () => void;
}

export function ArgModal({ config, onConfirm, onClose }: ArgModalProps) {
  const [values, setValues] = useState<string[]>(config.fields.map(() => ''));
  const [errors, setErrors] = useState<Array<string | null>>(config.fields.map(() => null));
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) handleSubmit();
  };

  const handleSubmit = () => {
    const newErrors = config.fields.map((field, i) => {
      if (!values[i].trim()) return 'Ce champ est requis';
      return field.validate?.(values[i]) ?? null;
    });
    setErrors(newErrors);
    if (newErrors.some(Boolean)) return;
    onConfirm(config.buildCommand(values.map(v => v.trim())));
    onClose();
  };

  const previewCmd = values.every(v => v.trim())
    ? config.buildCommand(values.map(v => v.trim()))
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)' }}
          >
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{config.title}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{config.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
          >
            <X size={15} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4">
          {config.fields.map((field, i) => (
            <div key={i}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {field.name}
              </label>
              <input
                ref={i === 0 ? firstInputRef : undefined}
                type="text"
                value={values[i]}
                onChange={e => {
                  const next = [...values]; next[i] = e.target.value;
                  setValues(next);
                  if (errors[i]) { const ne = [...errors]; ne[i] = null; setErrors(ne); }
                }}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none transition-colors"
                style={{
                  background: 'var(--bg-input, #1e293b)',
                  border: `1px solid ${errors[i] ? '#f87171' : 'var(--border-color)'}`,
                  color: 'var(--text-primary)',
                }}
              />
              {errors[i] && (
                <p className="mt-1 text-xs" style={{ color: '#f87171' }}>{errors[i]}</p>
              )}
              <p className="mt-1.5 text-xs flex items-start gap-1" style={{ color: 'var(--text-muted)' }}>
                <Info size={11} className="mt-0.5 shrink-0" />
                {field.hint}
              </p>

              {/* Suggestions (ex: préfixes de commit) */}
              {field.suggestions && field.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {field.suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        const next = [...values]; next[i] = s + ' ';
                        setValues(next);
                        firstInputRef.current?.focus();
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-mono transition-opacity hover:opacity-80"
                      style={{ background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Aperçu de la commande */}
          {previewCmd && (
            <div className="px-3 py-2 rounded-lg" style={{ background: '#060d1a', border: '1px solid #1e293b' }}>
              <p className="text-[10px] mb-1" style={{ color: '#334155' }}>Commande qui sera exécutée :</p>
              <code className="text-xs font-mono break-all" style={{ color: '#4ade80' }}>
                $ {previewCmd}
              </code>
            </div>
          )}

          {config.example && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Exemple : <code className="font-mono" style={{ color: 'var(--gold)' }}>{config.example}</code>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}
          >
            Exécuter
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
