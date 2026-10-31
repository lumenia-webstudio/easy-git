import { useEffect, useState } from 'react';
import { Bell, BellOff, GitPullRequest, AlertCircle, Tag, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { SkeletonList } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Avatar } from '../../components/ui/Avatar';
import type { GitHubNotification } from '../../types';

type Filter = 'all' | 'unread';

const typeIcon = (type: string) => {
  switch (type) {
    case 'PullRequest': return <GitPullRequest size={14} className="text-emerald-400" />;
    case 'Issue': return <AlertCircle size={14} className="text-sky-400" />;
    case 'Release': return <Tag size={14} className="text-amber-400" />;
    default: return <Bell size={14} className="text-slate-400" />;
  }
};

const timeAgo = (date: string): string => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export function NotificationsPage() {
  const { api, t, showToast } = useApp();
  const [notifications, setNotifications] = useState<GitHubNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [filter, setFilter] = useState<Filter>('unread');
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.notifications.list({ all: true, per_page: 50 });
      setNotifications(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [api]);

  const filtered = filter === 'unread'
    ? notifications.filter((n) => n.unread)
    : notifications;

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = async () => {
    if (!api) return;
    setMarkingAll(true);
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      showToast('success', t('notifications.markAllRead'));
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    if (!api) return;
    setMarkingId(id);
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n));
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setMarkingId(null);
    }
  };

  const reasonLabel = (reason: string): string => {
    const key = `notifications.reason.${reason}`;
    const result = t(key);
    return result === key ? reason : result;
  };

  const typeLabel = (type: string): string => {
    const key = `notifications.type.${type}`;
    const result = t(key);
    return result === key ? type : result;
  };

  return (
    <div className="flex flex-col">
      <Header
        title={t('notifications.title')}
        subtitle={unreadCount > 0 ? `${unreadCount} ${t('notifications.unread').toLowerCase()}` : undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={load} loading={loading}>
              {t('common.refresh')}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                icon={<BellOff size={14} />}
                loading={markingAll}
                onClick={handleMarkAllRead}
              >
                {t('notifications.markAllRead')}
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6 space-y-5">
        <div className="flex gap-2">
          {(['unread', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${filter === f
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600'}`}
            >
              {f === 'unread' ? t('notifications.filterUnread') : t('notifications.filterAll')}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-sky-500 text-white rounded-full text-xs leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {error ? (
          <ErrorMessage error={error} onRetry={load} />
        ) : loading ? (
          <SkeletonList count={8} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BellOff size={24} />}
            title={t('notifications.noNotifications')}
            description={t('notifications.noNotificationsHint')}
          />
        ) : (
          <div className="space-y-1">
            {filtered.map((notification) => (
              <div
                key={notification.id}
                className={`group flex items-start gap-3 p-4 rounded-xl border transition-colors
                  ${notification.unread
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950 border-slate-800/50 opacity-70 hover:opacity-100 hover:border-slate-700'}`}
              >
                <div className="relative mt-0.5 shrink-0">
                  <Avatar
                    src={notification.repository.owner.avatar_url}
                    name={notification.repository.owner.login}
                    size="sm"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5">
                    {typeIcon(notification.subject.type)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-medium truncate ${notification.unread ? 'text-slate-100' : 'text-slate-400'}`}>
                        {notification.subject.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-500">{notification.repository.full_name}</span>
                        <span className="text-xs text-slate-600">·</span>
                        <span className="text-xs text-slate-600">{typeLabel(notification.subject.type)}</span>
                        <span className="text-xs text-slate-600">·</span>
                        <span className="text-xs text-slate-600">{reasonLabel(notification.reason)}</span>
                        <span className="text-xs text-slate-600">·</span>
                        <span className="text-xs text-slate-600">{timeAgo(notification.updated_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {notification.unread && (
                        <button
                          onClick={() => handleMarkRead(notification.id)}
                          disabled={markingId === notification.id}
                          className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
                          title={t('notifications.markRead')}
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <a
                        href={`https://github.com/${notification.repository.full_name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title={t('profile.viewOnGitHub')}
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>

                {notification.unread && (
                  <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
