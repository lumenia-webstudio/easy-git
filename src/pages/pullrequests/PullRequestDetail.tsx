import { useEffect, useState } from 'react';
import { ArrowLeft, GitMerge, X, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { MarkdownViewer } from '../../components/ui/MarkdownViewer';
import { Modal } from '../../components/ui/Modal';
import type { GitHubPullRequest, GitHubComment } from '../../types';

interface PullRequestDetailProps {
  owner: string;
  repo: string;
  number: number;
  onBack: () => void;
}

type MergeMethod = 'merge' | 'squash' | 'rebase';

export function PullRequestDetail({ owner, repo, number, onBack }: PullRequestDetailProps) {
  const { api, t, showToast, confirm } = useApp();
  const [pr, setPr] = useState<GitHubPullRequest | null>(null);
  const [comments, setComments] = useState<GitHubComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);

  const load = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const [p, c] = await Promise.all([
        api.pulls.getPull(owner, repo, number),
        api.pulls.listComments(owner, repo, number),
      ]);
      setPr(p);
      setComments(c);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [owner, repo, number]);

  const handleClose = async () => {
    const result = await confirm({
      title: t('pulls.close.title'),
      message: t('pulls.close.warning'),
      severity: 'warning',
      confirmLabel: t('pulls.closePull'),
    });
    if (!result.confirmed) return;
    try {
      const updated = await api!.pulls.updatePull(owner, repo, number, { state: 'closed' });
      setPr(updated);
      showToast('success', `PR #${number} fermée`);
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const handleReopen = async () => {
    try {
      const updated = await api!.pulls.updatePull(owner, repo, number, { state: 'open' });
      setPr(updated);
      showToast('success', `PR #${number} réouverte`);
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const c = await api!.pulls.createComment(owner, repo, number, comment.trim());
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
    </div>
  );

  if (error) return <ErrorMessage error={error} onRetry={load} />;
  if (!pr) return null;

  const canMerge = pr.state === 'open' && !pr.draft && pr.mergeable !== false;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ArrowLeft size={16} /> {t('common.back')}
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${pr.merged ? 'bg-violet-500/20' : pr.state === 'open' ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
            {pr.merged ? <GitMerge size={14} className="text-violet-400" /> : <GitMerge size={14} className={pr.state === 'open' ? 'text-emerald-400' : 'text-slate-500'} />}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-slate-100 leading-snug">
              {pr.title}
              <span className="text-slate-500 font-normal ml-2">#{pr.number}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {pr.merged ? (
                <Badge variant="merged" dot>{t('pulls.merged')}</Badge>
              ) : pr.draft ? (
                <Badge variant="draft" dot>{t('pulls.draft')}</Badge>
              ) : (
                <Badge variant={pr.state === 'open' ? 'success' : 'default'} dot>
                  {pr.state === 'open' ? t('pulls.open') : t('pulls.closed')}
                </Badge>
              )}
              <span className="text-xs text-slate-500">
                {pr.head.ref} → {pr.base.ref}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-600">
              <span>{pr.commits} {t('pulls.commits')}</span>
              <span className="text-emerald-600">+{pr.additions}</span>
              <span className="text-red-600">-{pr.deletions}</span>
              <span>{pr.changed_files} {t('pulls.filesChanged')}</span>
            </div>
            {pr.mergeable === false && pr.state === 'open' && (
              <div className="mt-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400">{t('pulls.conflictsMsg')}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canMerge && (
              <Button size="sm" variant="success" icon={<GitMerge size={13} />} onClick={() => setMergeOpen(true)}>
                {t('pulls.merge.title')}
              </Button>
            )}
            {pr.state === 'open' && !pr.merged && (
              <Button size="sm" variant="ghost" icon={<X size={13} />} onClick={handleClose}>
                {t('pulls.closePull')}
              </Button>
            )}
            {pr.state === 'closed' && !pr.merged && (
              <Button size="sm" variant="ghost" onClick={handleReopen}>{t('pulls.reopenPull')}</Button>
            )}
          </div>
        </div>

        {pr.body && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <MarkdownViewer content={pr.body} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
          <MessageSquare size={14} />
          {comments.length} {t('pulls.addComment')}
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

        {pr.state === 'open' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('pulls.commentPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="primary" loading={submitting} onClick={handleComment} disabled={!comment.trim()}>
                {t('pulls.addComment')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {mergeOpen && pr && (
        <MergeModal
          pr={pr}
          onClose={() => setMergeOpen(false)}
          onMerged={() => {
            setMergeOpen(false);
            load();
          }}
          owner={owner}
          repo={repo}
        />
      )}
    </div>
  );
}

function MergeModal({ pr, owner, repo, onClose, onMerged }: {
  pr: GitHubPullRequest; owner: string; repo: string; onClose: () => void; onMerged: () => void;
}) {
  const { api, t, showToast, confirm } = useApp();
  const [method, setMethod] = useState<MergeMethod>('merge');
  const [merging, setMerging] = useState(false);

  const methods: Array<{ value: MergeMethod; label: string; desc: string }> = [
    { value: 'merge', label: t('pulls.merge.methodMerge'), desc: t('pulls.merge.methodMergeDesc') },
    { value: 'squash', label: t('pulls.merge.methodSquash'), desc: t('pulls.merge.methodSquashDesc') },
    { value: 'rebase', label: t('pulls.merge.methodRebase'), desc: t('pulls.merge.methodRebaseDesc') },
  ];

  const handleMerge = async () => {
    const result = await confirm({
      title: t('pulls.merge.title'),
      message: t('pulls.merge.warning', { head: pr.head.ref, base: pr.base.ref }),
      severity: 'warning',
      confirmLabel: t('common.merge'),
    });
    if (!result.confirmed) return;

    setMerging(true);
    try {
      await api!.pulls.mergePull(owner, repo, pr.number, method);
      showToast('success', t('pulls.merge.success'));
      onMerged();
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setMerging(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t('pulls.merge.title')} size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="success" size="sm" loading={merging} icon={<GitMerge size={13} />} onClick={handleMerge}>
            {t('common.merge')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {methods.map((m) => (
          <label key={m.value}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors
              ${method === m.value ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-700 hover:border-slate-600'}`}
          >
            <input type="radio" checked={method === m.value} onChange={() => setMethod(m.value)} className="mt-0.5 accent-emerald-500" />
            <div>
              <p className="text-sm font-medium text-slate-200">{m.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </Modal>
  );
}
