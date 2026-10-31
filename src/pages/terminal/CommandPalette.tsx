import { useState } from 'react';
import { Search, ChevronRight, X, CornerDownLeft, Clock, Lightbulb } from 'lucide-react';
import { TERMINAL_COMMANDS, CATEGORIES, type TerminalCommand } from './terminalCommands';
import type { GitState } from '../../components/terminal/StatusBar';

function getSuggestions(gitState: GitState | null): TerminalCommand[] {
  const find = (cmd: string) => TERMINAL_COMMANDS.find(c => c.cmd === cmd);

  if (!gitState) return [];

  if (gitState.conflict) {
    return [
      find('git status'),
      { cmd: 'git merge --abort', desc: 'Abort the current merge', descFr: 'Annuler la fusion en cours', category: 'Branches', categoryFr: 'Branches' },
      { cmd: 'git checkout --theirs .', desc: 'Accept all incoming changes', descFr: 'Accepter tous les changements entrants', category: 'Branches', categoryFr: 'Branches' },
    ].filter(Boolean) as TerminalCommand[];
  }

  if (gitState.dirty) {
    return [
      find('git status'),
      find('git diff'),
      find('git add .'),
      find('git stash'),
    ].filter(Boolean) as TerminalCommand[];
  }

  if (gitState.branch) {
    return [
      find('git pull'),
      { cmd: `git push origin ${gitState.branch}`, desc: `Push ${gitState.branch} to remote`, descFr: `Pousser ${gitState.branch} vers le dépôt distant`, category: 'Remote', categoryFr: 'Dépôt distant' },
      find('git log --oneline --graph'),
      find('git branch'),
    ].filter(Boolean) as TerminalCommand[];
  }

  // Pas dans un dépôt git
  return [find('git init'), find('git clone https://github.com/user/repo.git')].filter(Boolean) as TerminalCommand[];
}

export function CommandPalette({
  language,
  onSelect,
  history = [],
  onHistorySelect,
  gitState = null,
}: {
  language: string;
  onSelect: (cmd: TerminalCommand) => void;
  history?: string[];
  onHistorySelect?: (cmd: string) => void;
  gitState?: GitState | null;
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const suggestions = getSuggestions(gitState);
  const q = search.toLowerCase().trim();
  const filtered = TERMINAL_COMMANDS.filter(c => {
    const matchSearch = !q || c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.descFr.toLowerCase().includes(q);
    const matchCat = !activeCategory || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div
      className="flex flex-col"
      style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div className="px-3 py-2.5" style={{ borderBottom: '1px solid #1e293b' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#64748b' }}>
          {language === 'fr' ? 'Commandes disponibles' : 'Available commands'}
        </p>
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
          style={{ background: '#1e293b', border: '1px solid #334155' }}
        >
          <Search size={12} style={{ color: '#475569' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={language === 'fr' ? 'Filtrer les commandes...' : 'Filter commands...'}
            className="flex-1 bg-transparent text-xs focus:outline-none font-mono"
            style={{ color: '#e2e8f0' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: '#475569' }}>
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap px-3 py-2" style={{ borderBottom: '1px solid #1e293b' }}>
        <button
          onClick={() => setActiveCategory(null)}
          className="px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
          style={{
            background: !activeCategory ? '#1d4ed8' : '#1e293b',
            color: !activeCategory ? '#bfdbfe' : '#64748b',
          }}
        >
          {language === 'fr' ? 'Tout' : 'All'}
        </button>
        {CATEGORIES.map(cat => {
          const catFr = TERMINAL_COMMANDS.find(c => c.category === cat)?.categoryFr ?? cat;
          const label = language === 'fr' ? catFr : cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className="px-2 py-0.5 rounded text-[10px] font-medium transition-colors"
              style={{
                background: activeCategory === cat ? '#1d4ed8' : '#1e293b',
                color: activeCategory === cat ? '#bfdbfe' : '#64748b',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {suggestions.length > 0 && !q && (
        <div style={{ borderBottom: '1px solid #1e293b' }}>
          <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
            <Lightbulb size={10} style={{ color: 'var(--gold)' }} />
            <p className="text-[10px] font-semibold" style={{ color: 'var(--gold)' }}>
              {language === 'fr' ? 'Suggestions' : 'Suggestions'}
            </p>
            {gitState?.conflict && (
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: '#450a0a', color: '#f87171' }}>
                {language === 'fr' ? 'Conflits' : 'Conflicts'}
              </span>
            )}
            {gitState?.dirty && !gitState.conflict && (
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-medium" style={{ background: '#422006', color: '#fbbf24' }}>
                {gitState.changes} {language === 'fr' ? 'modif.' : 'changes'}
              </span>
            )}
          </div>
          {suggestions.map((cmd, i) => (
            <button
              key={i}
              onClick={() => onSelect(cmd)}
              className="w-full flex items-start gap-3 px-3 py-1.5 text-left transition-colors group/sug"
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1e293b')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
            >
              <span className="text-xs font-mono shrink-0 mt-0.5" style={{ color: 'var(--gold)' }}>$</span>
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono block truncate" style={{ color: '#e2e8f0' }}>{cmd.cmd}</code>
                <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>
                  {language === 'fr' ? cmd.descFr : cmd.desc}
                </p>
              </div>
              <ChevronRight size={10} className="shrink-0 mt-1 opacity-0 group-hover/sug:opacity-100 transition-opacity" style={{ color: 'var(--gold)' }} />
            </button>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div style={{ borderBottom: '1px solid #1e293b' }}>
          <div className="flex items-center gap-1.5 px-3 pt-2 pb-1">
            <Clock size={10} style={{ color: '#475569' }} />
            <p className="text-[10px] font-semibold" style={{ color: '#475569' }}>
              {language === 'fr' ? 'Récents' : 'Recent'}
            </p>
          </div>
          {history.map((cmd, i) => (
            <button
              key={i}
              onClick={() => onHistorySelect?.(cmd)}
              className="w-full flex items-center gap-3 px-3 py-1.5 text-left transition-colors"
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1e293b')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
            >
              <span className="text-xs font-mono shrink-0" style={{ color: '#475569' }}>$</span>
              <code className="flex-1 text-xs font-mono truncate" style={{ color: '#94a3b8' }}>{cmd}</code>
              <ChevronRight size={10} className="shrink-0 opacity-0 group-hover:opacity-100" style={{ color: '#4ade80' }} />
            </button>
          ))}
        </div>
      )}

      <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
        {filtered.length === 0 ? (
          <p className="text-center py-6 text-xs" style={{ color: '#334155' }}>
            {language === 'fr' ? 'Aucune commande trouvée' : 'No commands found'}
          </p>
        ) : (
          filtered.map((cmd, i) => (
            <button
              key={i}
              onClick={() => onSelect(cmd)}
              className="w-full flex items-start gap-3 px-3 py-2 text-left transition-colors group/cmd"
              style={{ borderBottom: '1px solid #1e293b' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#1e293b')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
            >
              <span className="text-xs font-mono shrink-0 mt-0.5" style={{ color: '#4ade80' }}>$</span>
              <div className="flex-1 min-w-0">
                <code className="text-xs font-mono block truncate" style={{ color: '#e2e8f0' }}>{cmd.cmd}</code>
                <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: '#64748b' }}>
                  {language === 'fr' ? cmd.descFr : cmd.desc}
                </p>
              </div>
              <ChevronRight size={11} className="shrink-0 mt-1 opacity-0 group-hover/cmd:opacity-100 transition-opacity" style={{ color: '#4ade80' }} />
            </button>
          ))
        )}
      </div>

      <div className="px-3 py-2 flex items-center gap-1.5" style={{ borderTop: '1px solid #1e293b' }}>
        <CornerDownLeft size={10} style={{ color: '#334155' }} />
        <p className="text-[10px]" style={{ color: '#334155' }}>
          {language === 'fr' ? "Cliquez sur une commande pour l'envoyer au terminal" : 'Click a command to send it to the terminal'}
        </p>
      </div>
    </div>
  );
}
