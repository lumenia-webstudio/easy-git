import { useEffect, useState } from 'react';
import { AlertCircle, Plus, MessageSquare, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { IssueDetail } from './IssueDetail';
import type { GitHubIssue } from '../../types';

interface IssuesPageProps {
  owner: string;
  repo: string;
}

export function IssuesPage({ owner, repo }: IssuesPageProps) {
  const { api, t } = useApp();
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
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
      const data = await api.issues.listIssues(owner, repo, { state: f === 'all' ? 'all' : f });
      setIssues(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [owner, repo, filter]);

  const timeAgo = (date: string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor(diff / 3600000);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
    if (hrs < 24) return `${hrs}h`;
    return `${days}j`;
  };

  if (selected !== null) {
    return (
      <IssueDetail
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
              {t(`issues.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
            </button>
          ))}
        </div>
        <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
          {t('issues.newIssue')}
        </Button>
      </div>

      {error ? (
        <ErrorMessage error={error} onRetry={load} />
      ) : loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : issues.length === 0 ? (
        <EmptyState
          icon={<AlertCircle size={22} />}
          title={t('issues.noIssues')}
          description={t('issues.noIssuesHint')}
          action={{ label: t('issues.newIssue'), onClick: () => setCreateOpen(true), icon: <Plus size={14} /> }}
        />
      ) : (
        <div className="space-y-2">
          {issues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => setSelected(issue.number)}
              className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-4 py-3.5 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className={`mt-0.5 shrink-0 ${issue.state === 'open' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-200 group-hover:text-sky-400 transition-colors">
                      {issue.title}
                    </span>
                    {issue.locked && <Lock size={12} className="text-amber-400" />}
                    {issue.labels.map((label) => (
                      <span
                        key={label.id}
                        className="px-2 py-0.5 rounded-full text-xs border"
                        style={{
                          backgroundColor: `#${label.color}22`,
                          borderColor: `#${label.color}44`,
                          color: `#${label.color}`,
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>#{issue.number}</span>
                    <span>{t('issues.openedBy')} {issue.user.login}</span>
                    <span>{timeAgo(issue.created_at)}</span>
                    {issue.milestone && (
                      <span className="text-slate-600">{issue.milestone.title}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {issue.assignees.length > 0 && (
                    <div className="flex -space-x-1">
                      {issue.assignees.slice(0, 3).map((a) => (
                        <Avatar key={a.login} src={a.avatar_url} name={a.login} size="xs" />
                      ))}
                    </div>
                  )}
                  {issue.comments > 0 && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MessageSquare size={12} /> {issue.comments}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {createOpen && (
        <CreateIssueModal
          owner={owner}
          repo={repo}
          onClose={() => setCreateOpen(false)}
          onCreated={(issue) => {
            setIssues((prev) => [issue, ...prev]);
            setCreateOpen(false);
            setSelected(issue.number);
          }}
        />
      )}
    </div>
  );
}

function CreateIssueModal({ owner, repo, onClose, onCreated }: {
  owner: string; repo: string; onClose: () => void; onCreated: (i: GitHubIssue) => void;
}) {
  const { api, t, showToast } = useApp();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const issue = await api!.issues.createIssue(owner, repo, { title: title.trim(), body: body.trim() || undefined });
      showToast('success', `Issue #${issue.number} créée`);
      onCreated(issue);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t('issues.create.title')} size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleCreate} disabled={!title.trim()}>
            {t('common.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label={t('common.title')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('issues.create.titlePlaceholder')}
          required
        />
        <Textarea
          label={t('common.description')}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('issues.create.bodyPlaceholder')}
          rows={8}
        />
      </div>
    </Modal>
  );
}
