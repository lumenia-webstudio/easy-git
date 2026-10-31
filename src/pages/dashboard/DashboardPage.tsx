import { useEffect, useState } from 'react';
import { Users, Star, FolderGit2, UserCheck, GitCommitVertical as GitCommit, GitPullRequest, AlertCircle, Tag, FolderOpen, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout/Header';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import type { GitHubUser, GitHubEvent, GitHubRepo } from '../../types';

const GOLD = 'var(--gold)';
const GOLD_DIM = 'var(--gold-dim)';

function GlassCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-color)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function DashboardPage() {
  const { api, activeAccount, t, navigate } = useApp();
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = async () => {
    if (!api || !activeAccount) return;
    setLoading(true);
    setError(null);
    try {
      const [u, r, e] = await Promise.all([
        api.users.getAuthenticatedUser(),
        api.repos.listRepos(1, 'updated'),
        api.users.getUserEvents(activeAccount.username),
      ]);
      setUser(u);
      setRepos(r.slice(0, 6));
      setEvents(e.slice(0, 10));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [api]);

  const formatEvent = (event: GitHubEvent): string => {
    const repo = event.repo.name;
    switch (event.type) {
      case 'PushEvent': return `${t('dashboard.events.pushed')} ${repo}`;
      case 'IssuesEvent': {
        const action = (event.payload as { action?: string }).action;
        return `${t(action === 'closed' ? 'dashboard.events.closed_issue' : 'dashboard.events.opened_issue')} ${repo}`;
      }
      case 'PullRequestEvent': {
        const action = (event.payload as { action?: string }).action;
        return `${t(action === 'closed' ? 'dashboard.events.merged_pr' : 'dashboard.events.opened_pr')} ${repo}`;
      }
      case 'WatchEvent': return `${t('dashboard.events.starred')} ${repo}`;
      case 'ForkEvent': return `${t('dashboard.events.forked')} ${repo}`;
      case 'CreateEvent': return `${t('dashboard.events.created')} ${repo}`;
      case 'DeleteEvent': return `${t('dashboard.events.deleted')} ${repo}`;
      case 'ReleaseEvent': return `${t('dashboard.events.released')} ${repo}`;
      default: return repo;
    }
  };

  const eventIcon = (type: string) => {
    switch (type) {
      case 'PushEvent': return <GitCommit size={13} className="shrink-0" style={{ color: '#38bdf8' }} />;
      case 'IssuesEvent': return <AlertCircle size={13} className="shrink-0" style={{ color: '#fb923c' }} />;
      case 'PullRequestEvent': return <GitPullRequest size={13} className="shrink-0" style={{ color: '#34d399' }} />;
      case 'WatchEvent': return <Star size={13} className="shrink-0" style={{ color: GOLD }} />;
      case 'ReleaseEvent': return <Tag size={13} className="shrink-0" style={{ color: '#38bdf8' }} />;
      default: return <FolderOpen size={13} className="shrink-0 text-slate-500" />;
    }
  };

  const timeAgo = (date: string, lang: string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (lang === 'fr') {
      if (mins < 2) return "à l'instant";
      if (mins < 60) return `il y a ${mins} min`;
      if (hrs < 24) return `il y a ${hrs}h`;
      return `il y a ${days}j`;
    }
    if (mins < 2) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  };

  const { language } = useApp();

  if (error) return (
    <div className="flex flex-col">
      <Header title={t('nav.dashboard')} />
      <div className="p-6"><ErrorMessage error={error} onRetry={load} /></div>
    </div>
  );

  const stats = user ? [
    { label: t('dashboard.stats.repos'), value: user.public_repos, icon: <FolderGit2 size={16} />, color: '#38bdf8' },
    { label: t('dashboard.stats.followers'), value: user.followers, icon: <Users size={16} />, color: GOLD },
    { label: t('dashboard.stats.following'), value: user.following, icon: <UserCheck size={16} />, color: '#34d399' },
    { label: t('dashboard.stats.stars'), value: user.public_gists, icon: <TrendingUp size={16} />, color: '#fb923c' },
  ] : [];

  return (
    <div className="flex flex-col">
      <Header title={`${t('dashboard.hello')}, ${user?.name ?? user?.login ?? activeAccount?.username ?? '...'}`} />

      <div className="p-6 space-y-5">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {user && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map((stat) => (
                  <GlassCard key={stat.label} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-500 text-xs">{stat.label}</span>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: `${stat.color}15`, color: stat.color }}
                      >
                        {stat.icon}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{stat.value.toLocaleString()}</p>
                    <div className="mt-2 h-0.5 rounded-full" style={{ background: `linear-gradient(to right, ${stat.color}40, transparent)` }} />
                  </GlassCard>
                ))}
              </div>
            )}

            {user && (
              <GlassCard className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar src={user.avatar_url} name={user.name ?? user.login} size="xl" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-slate-100">
                      {user.name ?? user.login}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: GOLD_DIM }}>@{user.login}</p>
                    {user.bio && (
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{user.bio}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate({ name: 'profile' })}
                    className="text-xs shrink-0 px-3 py-1.5 rounded-lg transition-all"
                    style={{ color: GOLD, border: '1px solid rgba(240,180,41,0.2)', background: 'rgba(240,180,41,0.06)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,180,41,0.12)'; e.currentTarget.style.borderColor = 'rgba(240,180,41,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(240,180,41,0.06)'; e.currentTarget.style.borderColor = 'rgba(240,180,41,0.2)'; }}
                  >
                    {t('profile.editProfile')} →
                  </button>
                </div>
              </GlassCard>
            )}

            <div className="grid lg:grid-cols-2 gap-4">
              <GlassCard>
                <div
                  className="px-5 py-3.5 flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--border-section)' }}
                >
                  <h2 className="text-sm font-semibold text-slate-200">{t('dashboard.recentActivity')}</h2>
                  <div className="w-2 h-2 rounded-full" style={{ background: GOLD, boxShadow: `0 0 6px ${GOLD}` }} />
                </div>
                <div>
                  {events.length === 0 ? (
                    <p className="text-center py-8 text-sm text-slate-600">{t('dashboard.noActivity')}</p>
                  ) : (
                    events.map((event, idx) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-3 px-5 py-3 transition-colors"
                        style={{ borderBottom: idx < events.length - 1 ? '1px solid var(--border-section)' : undefined }}
                      >
                        <div className="mt-0.5">{eventIcon(event.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 leading-snug">{formatEvent(event)}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--gold-faint)' }}>{timeAgo(event.created_at, language)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>

              <GlassCard>
                <div
                  className="px-5 py-3.5 flex items-center justify-between"
                  style={{ borderBottom: '1px solid var(--border-section)' }}
                >
                  <h2 className="text-sm font-semibold text-slate-200">{t('dashboard.recentRepos')}</h2>
                  <button
                    onClick={() => navigate({ name: 'repositories' })}
                    className="text-xs transition-colors"
                    style={{ color: GOLD_DIM }}
                    onMouseEnter={e => (e.currentTarget.style.color = GOLD)}
                    onMouseLeave={e => (e.currentTarget.style.color = GOLD_DIM)}
                  >
                    {t('common.view')} →
                  </button>
                </div>
                <div>
                  {repos.length === 0 ? (
                    <p className="text-center py-8 text-sm text-slate-600">{t('repos.noRepos')}</p>
                  ) : (
                    repos.map((repo, idx) => (
                      <button
                        key={repo.id}
                        onClick={() => navigate({ name: 'repository', owner: repo.owner.login, repo: repo.name, tab: 'files' })}
                        className="w-full flex items-start gap-3 px-5 py-3 transition-colors text-left group"
                        style={{ borderBottom: idx < repos.length - 1 ? '1px solid var(--border-section)' : undefined }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
                      >
                        <FolderGit2 size={14} className="mt-0.5 shrink-0 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-200 truncate group-hover:text-slate-50 transition-colors">{repo.name}</span>
                            {repo.private && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                                style={{ background: 'rgba(240,180,41,0.08)', color: GOLD_DIM, border: '1px solid rgba(240,180,41,0.15)' }}
                              >
                                {t('common.private')}
                              </span>
                            )}
                          </div>
                          {repo.description && (
                            <p className="text-xs text-slate-600 truncate mt-0.5">{repo.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0 text-xs text-slate-700">
                          {repo.stargazers_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Star size={10} style={{ color: GOLD_DIM }} />
                              <span style={{ color: GOLD_DIM }}>{repo.stargazers_count}</span>
                            </span>
                          )}
                          {repo.language && <span className="text-slate-600">{repo.language}</span>}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl p-5 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <Skeleton className="h-4 w-36" />
            <SkeletonText lines={5} />
          </div>
        ))}
      </div>
    </div>
  );
}
