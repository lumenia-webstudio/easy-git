import { useEffect, useState } from 'react';
import { GitPullRequest, Plus, GitMerge } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { PullRequestDetail } from './PullRequestDetail';
import type { GitHubPullRequest, GitHubBranch } from '../../types';

interface PullRequestsPageProps {
  owner: string;
  repo: string;
}

export function PullRequestsPage({ owner, repo }: PullRequestsPageProps) {
  const { api, t } = useApp();
  const [prs, setPrs] = useState<GitHubPullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [filter, setFilter] = useState<'open' | 'closed' | 'all'>('open');
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const load = async (f = filter) => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.pulls.listPulls(owner, repo, { state: f === 'all' ? 'all' : f });
      setPrs(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [owner, repo, filter]);

  const getPRStatus = (pr: GitHubPullRequest): { variant: 'success' | 'default' | 'merged' | 'draft'; label: string } => {
    if (pr.merged) return { variant: 'merged', label: t('pulls.merged') };
    if (pr.draft) return { variant: 'draft', label: t('pulls.draft') };
    if (pr.state === 'open') return { variant: 'success', label: t('pulls.open') };
    return { variant: 'default', label: t('pulls.closed') };
  };

  const timeAgo = (date: string): string => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days === 0) return "aujourd'hui";
    if (days === 1) return 'hier';
    return `il y a ${days}j`;
  };

  if (selected !== null) {
    return (
      <PullRequestDetail
        owner={owner}
        repo={repo}
        number={selected}
        onBack={() => { setSelected(null); load(); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(['open', 'closed', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${filter === f ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border border-slate-700'}`}
            >
              {t(`pulls.${f === 'open' ? 'open' : f === 'closed' ? 'closed' : 'noPulls'}`)}
              {f === 'all' ? t('common.all') : null}
            </button>
          ))}
        </div>
        <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
          {t('pulls.newPull')}
        </Button>
      </div>

      {error ? (
        <ErrorMessage error={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : prs.length === 0 ? (
        <EmptyState
          icon={<GitPullRequest size={22} />}
          title={t('pulls.noPulls')}
          description={t('pulls.noPullsHint')}
          action={{ label: t('pulls.newPull'), onClick: () => setCreateOpen(true), icon: <Plus size={14} /> }}
        />
      ) : (
        <div className="space-y-2">
          {prs.map((pr) => {
            const status = getPRStatus(pr);
            return (
              <button
                key={pr.id}
                onClick={() => setSelected(pr.number)}
                className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3.5 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  {pr.merged ? (
                    <GitMerge size={16} className="text-violet-400 mt-0.5 shrink-0" />
                  ) : (
                    <GitPullRequest size={16} className={`mt-0.5 shrink-0 ${pr.state === 'open' ? 'text-emerald-400' : 'text-slate-500'}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-200 group-hover:text-sky-400 transition-colors">
                        {pr.title}
                      </span>
                      <Badge variant={status.variant} dot size="sm">{status.label}</Badge>
                      {pr.labels.map((label) => (
                        <span key={label.id} className="px-1.5 py-0.5 rounded-full text-xs border"
                          style={{ backgroundColor: `#${label.color}22`, borderColor: `#${label.color}44`, color: `#${label.color}` }}>
                          {label.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>#{pr.number}</span>
                      <span className="text-slate-600">
                        {pr.head.ref} → {pr.base.ref}
                      </span>
                      <span>{t('pulls.openedBy')} {pr.user.login}</span>
                      <span>{timeAgo(pr.created_at)}</span>
                    </div>
                  </div>
                  {pr.requested_reviewers.length > 0 && (
                    <div className="flex -space-x-1 shrink-0">
                      {pr.requested_reviewers.slice(0, 3).map((r) => (
                        <Avatar key={r.login} src={r.avatar_url} name={r.login} size="xs" />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {createOpen && (
        <CreatePRModal
          owner={owner}
          repo={repo}
          onClose={() => setCreateOpen(false)}
          onCreated={(pr) => { setPrs((prev) => [pr, ...prev]); setCreateOpen(false); setSelected(pr.number); }}
        />
      )}
    </div>
  );
}

function CreatePRModal({ owner, repo, onClose, onCreated }: {
  owner: string; repo: string; onClose: () => void; onCreated: (pr: GitHubPullRequest) => void;
}) {
  const { api, t, showToast } = useApp();
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [head, setHead] = useState('');
  const [base, setBase] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [sameError, setSameError] = useState(false);

  useEffect(() => {
    api!.branches.listBranches(owner, repo).then((b) => {
      setBranches(b);
      if (b.length >= 2) { setHead(b[0].name); setBase(b[b.length - 1].name); }
      setLoadingBranches(false);
    }).catch(() => setLoadingBranches(false));
  }, []);

  const handleCreate = async () => {
    if (head === base) { setSameError(true); return; }
    if (!title.trim()) return;
    setLoading(true);
    try {
      const pr = await api!.pulls.createPull(owner, repo, { title: title.trim(), body: body.trim() || undefined, head, base });
      showToast('success', `Pull request #${pr.number} créée`);
      onCreated(pr);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t('pulls.create.title')} size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleCreate} disabled={!title.trim() || head === base}>
            {t('common.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('pulls.create.sourceBranch')}</label>
            <select disabled={loadingBranches} value={head} onChange={(e) => { setHead(e.target.value); setSameError(false); }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50">
              {branches.map((b) => <option key={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('pulls.create.targetBranch')}</label>
            <select disabled={loadingBranches} value={base} onChange={(e) => { setBase(e.target.value); setSameError(false); }}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50">
              {branches.map((b) => <option key={b.name}>{b.name}</option>)}
            </select>
          </div>
        </div>
        {sameError && (
          <p className="text-xs text-red-400">{t('pulls.create.sameBranchError')}</p>
        )}
        <Input label={t('common.title')} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('pulls.create.titlePlaceholder')} required />
        <Textarea label={t('common.description')} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('pulls.create.bodyPlaceholder')} rows={6} />
      </div>
    </Modal>
  );
}
