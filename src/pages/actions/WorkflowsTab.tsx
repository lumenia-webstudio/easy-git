import { useEffect, useState } from 'react';
import {
  Play, XCircle, CheckCircle, Clock, AlertTriangle,
  RefreshCw, ExternalLink, RotateCcw, Zap, GitBranch,
  User, Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { SkeletonList } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Avatar } from '../../components/ui/Avatar';
import type { GitHubWorkflowRun } from '../../types';

interface Props {
  owner: string;
  repo: string;
}

type StatusType = 'queued' | 'in_progress' | 'completed' | 'waiting' | 'requested' | 'pending';
type ConclusionType = 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;

const StatusBadge = ({ status, conclusion }: { status: StatusType; conclusion: ConclusionType }) => {
  if (status !== 'completed') {
    if (status === 'in_progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/15 text-sky-400 border border-sky-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          In progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-400 border border-slate-600">
        <Clock size={10} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  switch (conclusion) {
    case 'success':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <CheckCircle size={10} />
          Success
        </span>
      );
    case 'failure':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20">
          <XCircle size={10} />
          Failed
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-400 border border-slate-600">
          <XCircle size={10} />
          Cancelled
        </span>
      );
    case 'timed_out':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
          <AlertTriangle size={10} />
          Timed out
        </span>
      );
    case 'action_required':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
          <AlertTriangle size={10} />
          Action required
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-400 border border-slate-600">
          {conclusion ?? status}
        </span>
      );
  }
};

const eventLabel = (event: string): string => {
  const map: Record<string, string> = {
    push: 'Push',
    pull_request: 'Pull request',
    schedule: 'Scheduled',
    workflow_dispatch: 'Manual',
    release: 'Release',
    workflow_call: 'Workflow',
  };
  return map[event] ?? event;
};

const timeAgo = (date: string): string => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export function WorkflowsTab({ owner, repo }: Props) {
  const { api, t, showToast } = useApp();
  const [runs, setRuns] = useState<GitHubWorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.workflows.listRuns(owner, repo, { per_page: 25 });
      setRuns(data.workflow_runs ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [owner, repo]);

  const handleReRun = async (run: GitHubWorkflowRun) => {
    if (!api) return;
    setActionLoading(run.id);
    try {
      await api.workflows.reRunWorkflow(owner, repo, run.id);
      showToast('success', t('actions.reRun'));
      setTimeout(load, 2000);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReRunFailed = async (run: GitHubWorkflowRun) => {
    if (!api) return;
    setActionLoading(run.id);
    try {
      await api.workflows.reRunFailedJobs(owner, repo, run.id);
      showToast('success', t('actions.reRunFailed'));
      setTimeout(load, 2000);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (run: GitHubWorkflowRun) => {
    if (!api) return;
    setActionLoading(run.id);
    try {
      await api.workflows.cancelRun(owner, repo, run.id);
      showToast('success', t('actions.cancelRun'));
      setTimeout(load, 2000);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setActionLoading(null);
    }
  };

  if (error) return <ErrorMessage error={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {runs.length > 0 ? `${runs.length} recent runs` : ''}
        </p>
        <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />} onClick={load} loading={loading}>
          {t('common.refresh')}
        </Button>
      </div>

      {loading ? (
        <SkeletonList count={5} />
      ) : runs.length === 0 ? (
        <EmptyState
          icon={<Zap size={24} />}
          title={t('actions.noRuns')}
          description={t('actions.noRunsHint')}
        />
      ) : (
        <div className="space-y-2">
          {runs.map((run) => (
            <div
              key={run.id}
              className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {run.status === 'in_progress' ? (
                    <div className="w-8 h-8 rounded-full bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
                      <Play size={14} className="text-sky-400" />
                    </div>
                  ) : run.conclusion === 'success' ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle size={14} className="text-emerald-400" />
                    </div>
                  ) : run.conclusion === 'failure' || run.conclusion === 'timed_out' ? (
                    <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                      <XCircle size={14} className="text-red-400" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                      <Clock size={14} className="text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">
                        {run.display_title || run.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{run.name}</p>
                    </div>
                    <StatusBadge status={run.status} conclusion={run.conclusion} />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <GitBranch size={11} />
                      {run.head_branch}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap size={11} />
                      {eventLabel(run.event)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Avatar src={run.actor.avatar_url} name={run.actor.login} size="xs" />
                      <User size={11} />
                      {run.actor.login}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {timeAgo(run.created_at)}
                    </span>
                    <span className="text-slate-600">#{run.run_number}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(run.status === 'in_progress' || run.status === 'queued') && (
                    <button
                      onClick={() => handleCancel(run)}
                      disabled={actionLoading === run.id}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title={t('actions.cancelRun')}
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                  {run.status === 'completed' && run.conclusion === 'failure' && (
                    <button
                      onClick={() => handleReRunFailed(run)}
                      disabled={actionLoading === run.id}
                      className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                      title={t('actions.reRunFailed')}
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                  {run.status === 'completed' && (
                    <button
                      onClick={() => handleReRun(run)}
                      disabled={actionLoading === run.id}
                      className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
                      title={t('actions.reRun')}
                    >
                      <Play size={14} />
                    </button>
                  )}
                  <a
                    href={run.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                    title={t('actions.viewOnGitHub')}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
