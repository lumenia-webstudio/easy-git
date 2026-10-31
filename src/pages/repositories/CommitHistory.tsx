import { useEffect, useState } from 'react';
import { GitCommitVertical as GitCommit, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import type { GitHubCommit } from '../../types';

interface CommitHistoryProps {
  owner: string;
  repo: string;
  defaultBranch?: string;
}

export function CommitHistory({ owner, repo, defaultBranch }: CommitHistoryProps) {
  const { api, t } = useApp();
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, GitHubCommit>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = async (p = 1) => {
    if (!api) return;
    if (p === 1) { setLoading(true); setError(null); }
    try {
      const data = await api.repos.listCommits(owner, repo, {
        sha: defaultBranch,
        page: p,
        per_page: 20,
      });
      setCommits((prev) => p === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === 20);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [owner, repo, defaultBranch]);

  const toggleExpand = async (sha: string) => {
    if (expanded === sha) { setExpanded(null); return; }
    setExpanded(sha);
    if (!detail[sha]) {
      setDetailLoading(sha);
      try {
        const data = await api!.repos.getCommit(owner, repo, sha);
        setDetail((prev) => ({ ...prev, [sha]: data }));
      } catch { /* silent */ }
      setDetailLoading(null);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next);
  };

  if (error) return <ErrorMessage error={error} onRetry={() => load()} />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">{t('commits.title')}</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : commits.length === 0 ? (
        <EmptyState icon={<GitCommit size={22} />} title={t('commits.noCommits')} />
      ) : (
        <div className="space-y-2">
          {commits.map((commit) => (
            <div
              key={commit.sha}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(commit.sha)}
                className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-slate-800/50 transition-colors text-left"
              >
                <Avatar
                  src={commit.author?.avatar_url}
                  name={commit.commit.author.name}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 leading-snug line-clamp-2">
                    {commit.commit.message.split('\n')[0]}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {commit.commit.author.name} — {formatDate(commit.commit.author.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <code className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                    {commit.sha.slice(0, 7)}
                  </code>
                  {expanded === commit.sha ? (
                    <ChevronUp size={14} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={14} className="text-slate-500" />
                  )}
                </div>
              </button>

              {expanded === commit.sha && (
                <div className="px-4 pb-4 border-t border-slate-800">
                  {detailLoading === commit.sha ? (
                    <div className="pt-3 space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ) : detail[commit.sha] ? (
                    <div className="pt-3 space-y-3">
                      {detail[commit.sha].commit.message.includes('\n') && (
                        <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans">
                          {detail[commit.sha].commit.message.slice(detail[commit.sha].commit.message.indexOf('\n') + 1).trim()}
                        </pre>
                      )}
                      {detail[commit.sha].stats && (
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-400">
                            {detail[commit.sha].files?.length ?? 0} {t('commits.filesChanged')}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Plus size={12} />{detail[commit.sha].stats!.additions} {t('commits.additions')}
                          </span>
                          <span className="flex items-center gap-1 text-red-400">
                            <Minus size={12} />{detail[commit.sha].stats!.deletions} {t('commits.deletions')}
                          </span>
                        </div>
                      )}
                      {detail[commit.sha].files && detail[commit.sha].files!.length > 0 && (
                        <div className="space-y-1">
                          {detail[commit.sha].files!.map((f) => (
                            <div key={f.filename} className="flex items-center justify-between text-xs py-1 border-t border-slate-800">
                              <span className={`truncate max-w-[70%] ${
                                f.status === 'added' ? 'text-emerald-400' :
                                f.status === 'removed' ? 'text-red-400' :
                                'text-slate-400'
                              }`}>{f.filename}</span>
                              <div className="flex items-center gap-2 text-slate-600 shrink-0">
                                <span className="text-emerald-600">+{f.additions}</span>
                                <span className="text-red-600">-{f.deletions}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-3 text-sm text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
            >
              {t('common.more')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
