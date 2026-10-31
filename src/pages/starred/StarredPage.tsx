import { useEffect, useState } from 'react';
import { Star, Search, GitFork, AlertCircle, Lock, FolderGit2, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout/Header';
import { SkeletonList } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import type { GitHubRepo } from '../../types';

const timeAgo = (date: string, lang: string): string => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  return new Intl.RelativeTimeFormat(lang, { numeric: 'auto' }).format(-days, 'day');
};

export function StarredPage() {
  const { api, t, navigate, showToast, language } = useApp();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');
  const [unstarring, setUnstarring] = useState<number | null>(null);

  const load = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.repos.listStarred(1, 100);
      setRepos(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [api]);

  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
    r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnstar = async (repo: GitHubRepo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!api) return;
    setUnstarring(repo.id);
    try {
      await api.repos.unstarRepo(repo.owner.login, repo.name);
      setRepos((prev) => prev.filter((r) => r.id !== repo.id));
      showToast('success', t('starred.unstar'));
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setUnstarring(null);
    }
  };

  return (
    <div className="flex flex-col">
      <Header
        title={t('starred.title')}
        subtitle={repos.length > 0 ? `${repos.length} repositories` : undefined}
      />

      <div className="p-6 space-y-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('starred.search')}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {error ? (
          <ErrorMessage error={error} onRetry={load} />
        ) : loading ? (
          <SkeletonList count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Star size={24} />}
            title={t('starred.noStarred')}
            description={t('starred.noStarredHint')}
          />
        ) : (
          <div className="grid gap-3">
            {filtered.map((repo) => (
              <div
                key={repo.id}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-colors cursor-pointer"
                onClick={() => navigate({ name: 'repository', owner: repo.owner.login, repo: repo.name, tab: 'files' })}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <FolderGit2 size={18} className="text-slate-500 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sky-400 group-hover:text-sky-300 transition-colors text-sm">
                          {repo.full_name}
                        </span>
                        {repo.private && (
                          <span className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                            <Lock size={10} /> {t('common.private')}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star size={11} /> {repo.stargazers_count.toLocaleString()}
                        </span>
                        {repo.forks_count > 0 && (
                          <span className="flex items-center gap-1">
                            <GitFork size={11} /> {repo.forks_count.toLocaleString()}
                          </span>
                        )}
                        {repo.open_issues_count > 0 && (
                          <span className="flex items-center gap-1">
                            <AlertCircle size={11} /> {repo.open_issues_count}
                          </span>
                        )}
                        <span>{t('repos.updatedAt')} {timeAgo(repo.updated_at, language)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('profile.viewOnGitHub')}
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={(e) => handleUnstar(repo, e)}
                      disabled={unstarring === repo.id}
                      className="p-1.5 text-yellow-500 hover:text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('starred.unstar')}
                    >
                      <Star size={14} className="fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
