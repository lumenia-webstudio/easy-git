import React from 'react';
import { ChevronRight, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Page } from '../../types';

interface Breadcrumb {
  label: string;
  page?: Page;
}

interface HeaderProps {
  breadcrumbs?: Breadcrumb[];
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Header({ breadcrumbs, title, subtitle, actions }: HeaderProps) {
  const { t, navigate, language, setLanguage } = useApp();

  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-3 px-6 py-3.5 min-h-[56px]">
        <div className="flex-1 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 mb-0.5">
              {breadcrumbs.map((bc, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} className="shrink-0" />}
                  {bc.page ? (
                    <button
                      onClick={() => navigate(bc.page!)}
                      className="text-xs transition-colors truncate max-w-[120px]"
                      style={{ color: 'var(--gold-dim)' }}
                    >
                      {bc.label}
                    </button>
                  ) : (
                    <span className="text-xs truncate max-w-[120px]" style={{ color: 'var(--text-muted)' }}>{bc.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          {title && (
            <div className="flex items-baseline gap-2 min-w-0">
              <h1 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{title}</h1>
              {subtitle && (
                <span className="text-xs truncate hidden sm:block" style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all"
            style={{ color: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--gold)';
              (e.currentTarget as HTMLElement).style.background = 'var(--gold-bg)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--gold-dim)';
              (e.currentTarget as HTMLElement).style.background = '';
            }}
            title={t('settings.language')}
          >
            <Globe size={13} />
            <span className="font-semibold uppercase tracking-wide">{language}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
