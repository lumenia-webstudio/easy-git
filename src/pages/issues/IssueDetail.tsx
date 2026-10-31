import { useEffect, useState } from 'react';
import { ArrowLeft, MessageSquare, Lock, Unlock, X, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { MarkdownViewer } from '../../components/ui/MarkdownViewer';
import type { GitHubIssue, GitHubComment } from '../../types';

interface IssueDetailProps {
  owner: string;
  repo: string;
  number: number;
  onBack: () => void;
}

export function IssueDetail({ owner, repo, number, onBack }: IssueDetailProps) {
  const { api, t, showToast, confirm } = useApp();
  const [issue, setIssue] = useState<GitHubIssue | null>(null);
  const [comments, setComments] = useState<GitHubComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const [i, c] = await Promise.all([
        api.issues.getIssue(owner, repo, number),
        api.issues.listComments(owner, repo, number),
      ]);
      setIssue(i);
      setComments(c);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [owner, repo, number]);

  const handleClose = async () => {
    if (!issue) return;
    try {
      const updated = await api!.issues.updateIssue(owner, repo, number, { state: 'closed' });
      setIssue(updated);
      showToast('success', `Issue #${number} résolue`);
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const handleReopen = async () => {
    if (!issue) return;
    try {
      const updated = await api!.issues.updateIssue(owner, repo, number, { state: 'open' });
      setIssue(updated);
      showToast('success', `Issue #${number} réouverte`);
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const handleLock = async () => {
    if (!issue) return;
    const result = await confirm({
      title: t('issues.lock.title'),
      message: t('issues.lock.warning'),
      severity: 'warning',
      confirmLabel: t('issues.lockIssue'),
    });
    if (!result.confirmed) return;
    try {
      await api!.issues.lockIssue(owner, repo, number);
      setIssue((i) => i ? { ...i, locked: true } : i);
      showToast('success', 'Commentaires verrouillés');
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const handleUnlock = async () => {
    try {
      await api!.issues.unlockIssue(owner, repo, number);
      setIssue((i) => i ? { ...i, locked: false } : i);
      showToast('success', 'Commentaires déverrouillés');
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const c = await api!.issues.createComment(owner, repo, number, comment.trim());
      setComments((prev) => [...prev, c]);
      setComment('');
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  if (error) return <ErrorMessage error={error} onRetry={load} />;

  if (!issue) return null;

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${issue.state === 'open' ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
            <CheckCircle size={14} className={issue.state === 'open' ? 'text-emerald-400' : 'text-slate-500'} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-slate-100 leading-snug">
              {issue.title}
              <span className="text-slate-500 font-normal ml-2">#{issue.number}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={issue.state === 'open' ? 'success' : 'default'} dot>
                {issue.state === 'open' ? t('issues.open') : t('issues.closed')}
              </Badge>
              {issue.locked && <Badge variant="warning"><Lock size={10} /> Verrouillé</Badge>}
              {issue.labels.map((label) => (
                <span
                  key={label.id}
                  className="px-2 py-0.5 rounded-full text-xs border"
                  style={{ backgroundColor: `#${label.color}22`, borderColor: `#${label.color}44`, color: `#${label.color}` }}
                >
                  {label.name}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {t('issues.openedBy')} <strong className="text-slate-400">{issue.user.login}</strong> — {formatDate(issue.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {issue.state === 'open' ? (
              <Button size="sm" variant="secondary" icon={<CheckCircle size={13} />} onClick={handleClose}>
                {t('issues.closeIssue')}
              </Button>
            ) : (
              <Button size="sm" variant="ghost" icon={<X size={13} />} onClick={handleReopen}>
                {t('issues.reopenIssue')}
              </Button>
            )}
            {issue.locked ? (
              <Button size="sm" variant="ghost" icon={<Unlock size={13} />} onClick={handleUnlock} />
            ) : (
              <Button size="sm" variant="ghost" icon={<Lock size={13} />} onClick={handleLock} />
            )}
          </div>
        </div>

        {issue.body && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <MarkdownViewer content={issue.body} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
          <MessageSquare size={14} />
          {comments.length} {t('issues.comments')}
        </h2>

        {comments.map((c) => (
          <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Avatar src={c.user.avatar_url} name={c.user.login} size="sm" />
              <div>
                <span className="text-sm font-medium text-slate-300">{c.user.login}</span>
                <span className="text-xs text-slate-600 ml-2">{formatDate(c.created_at)}</span>
              </div>
            </div>
            <MarkdownViewer content={c.body} />
          </div>
        ))}

        {!issue.locked && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={14} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-300">{t('issues.addComment')}</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('issues.commentPlaceholder')}
              rows={4}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="primary"
                loading={submitting}
                onClick={handleComment}
                disabled={!comment.trim()}
              >
                {t('issues.addComment')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
