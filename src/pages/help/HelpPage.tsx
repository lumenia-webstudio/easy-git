import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { useApp } from '../../context/AppContext';
import { HELP_SECTIONS, type HelpSection, type HelpBlockType } from './helpContent';

function searchSections(query: string): HelpSection[] {
  const q = query.toLowerCase().trim();
  if (!q) return HELP_SECTIONS;
  return HELP_SECTIONS.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.keywords.some(k => k.includes(q)) ||
    s.content.some(block => {
      if (block.type === 'text' || block.type === 'heading' || block.type === 'tip' || block.type === 'warning') {
        return block.text.toLowerCase().includes(q);
      }
      if (block.type === 'glossary') {
        return block.items.some(i => i.term.toLowerCase().includes(q) || i.def.toLowerCase().includes(q));
      }
      if (block.type === 'steps') {
        return block.steps.some(step => step.label.toLowerCase().includes(q) || step.desc.toLowerCase().includes(q));
      }
      if (block.type === 'code') {
        return block.code.toLowerCase().includes(q);
      }
      return false;
    })
  );
}

function renderBlock(block: HelpBlockType, idx: number) {
  switch (block.type) {
    case 'text':
      return <p key={idx} className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{block.text}</p>;
    case 'heading':
      return <h4 key={idx} className="text-sm font-semibold mt-5 mb-2" style={{ color: 'var(--text-primary)' }}>{block.text}</h4>;
    case 'tip':
      return (
        <div key={idx} className="flex gap-2 p-3 rounded-lg mb-3" style={{ background: '#052e16', border: '1px solid #166534' }}>
          <span className="shrink-0 mt-0.5">💡</span>
          <p className="text-xs leading-relaxed" style={{ color: '#4ade80' }}>{block.text}</p>
        </div>
      );
    case 'warning':
      return (
        <div key={idx} className="flex gap-2 p-3 rounded-lg mb-3" style={{ background: '#2d1a00', border: '1px solid #92400e' }}>
          <span className="shrink-0 mt-0.5">⚠️</span>
          <p className="text-xs leading-relaxed" style={{ color: '#fbbf24' }}>{block.text}</p>
        </div>
      );
    case 'code':
      return (
        <pre key={idx} className="p-3 rounded-lg text-xs font-mono mb-3 overflow-x-auto leading-relaxed" style={{ background: '#060d1a', border: '1px solid #1e293b', color: '#e2e8f0' }}>
          {block.code}
        </pre>
      );
    case 'steps':
      return (
        <ol key={idx} className="space-y-3 mb-3">
          {block.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                style={{ background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{step.label}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'glossary':
      return (
        <dl key={idx} className="space-y-0 mb-3">
          {block.items.map((item, i) => (
            <div key={i} className="flex gap-3 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <dt className="text-xs font-mono font-semibold w-44 shrink-0 pt-0.5" style={{ color: 'var(--gold)' }}>{item.term}</dt>
              <dd className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.def}</dd>
            </div>
          ))}
        </dl>
      );
  }
}

interface HelpPageProps {
  section?: string;
}

export function HelpPage({ section }: HelpPageProps) {
  const { language } = useApp();
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string>(section ?? HELP_SECTIONS[0].id);
  const contentRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => searchSections(search), [search]);
  const current = HELP_SECTIONS.find(s => s.id === activeId) ?? HELP_SECTIONS[0];

  useEffect(() => {
    if (section) setActiveId(section);
  }, [section]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (search) setSearch('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={language === 'fr' ? 'Manuel & Aide' : 'Help & Manual'}
        subtitle={language === 'fr' ? 'Guide complet Git pour débutants' : 'Complete Git guide for beginners'}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar navigation */}
        <div
          className="w-72 shrink-0 flex flex-col overflow-hidden"
          style={{ borderRight: '1px solid var(--border-color)', background: 'var(--bg-sidebar)' }}
        >
          {/* Barre de recherche */}
          <div className="p-3 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'var(--bg-input, #1e293b)', border: '1px solid var(--border-color)' }}
            >
              <Search size={13} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher dans le manuel...' : 'Search manual...'}
                className="flex-1 bg-transparent text-xs focus:outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }} type="button">
                  <X size={11} />
                </button>
              )}
            </div>
            {search && (
              <p className="text-[10px] mt-1.5 px-1" style={{ color: 'var(--text-muted)' }}>
                {results.length} résultat{results.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Liste des sections */}
          <nav className="flex-1 overflow-y-auto py-1">
            {results.length === 0 ? (
              <p className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>
                Aucun résultat pour "{search}"
              </p>
            ) : (
              results.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelect(s.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                  style={activeId === s.id ? {
                    background: 'var(--gold-active-bg)',
                    borderLeft: '2px solid var(--gold)',
                  } : {}}
                  onMouseEnter={e => { if (activeId !== s.id) (e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover-bg)'; }}
                  onMouseLeave={e => { if (activeId !== s.id) (e.currentTarget as HTMLElement).style.background = ''; }}
                  type="button"
                >
                  <span className="text-base shrink-0">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: activeId === s.id ? 'var(--gold)' : 'var(--text-secondary)' }}>
                      {s.title}
                    </p>
                  </div>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0"
                    style={{
                      background: s.level === 'beginner' ? '#052e16' : '#1a1a2e',
                      color: s.level === 'beginner' ? '#4ade80' : '#a78bfa',
                    }}
                  >
                    {s.level === 'beginner' ? '🟢' : '🟡'}
                  </span>
                </button>
              ))
            )}
          </nav>
        </div>

        {/* Contenu de la section */}
        <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            {/* En-tête de section */}
            <div className="flex items-start gap-3 mb-6">
              <span className="text-3xl shrink-0">{current.emoji}</span>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{current.title}</h2>
                <span
                  className="inline-block text-[10px] px-2 py-0.5 rounded font-medium mt-1"
                  style={{
                    background: current.level === 'beginner' ? '#052e16' : '#1a1a2e',
                    color: current.level === 'beginner' ? '#4ade80' : '#a78bfa',
                  }}
                >
                  {current.level === 'beginner'
                    ? (language === 'fr' ? '🟢 Débutant' : '🟢 Beginner')
                    : (language === 'fr' ? '🟡 Intermédiaire' : '🟡 Intermediate')}
                </span>
              </div>
            </div>

            {/* Blocs de contenu */}
            {current.content.map((block, i) => renderBlock(block, i))}
          </div>
        </div>
      </div>
    </div>
  );
}
