import { useEffect, useState } from 'react';
import { GitBranch, Plus, Trash2, Check, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import type { GitHubBranch } from '../../types';

interface BranchesTabProps {
  owner: string;
  repo: string;
  defaultBranch: string;
  onDefaultBranchChange: (branch: string) => void;
}

export function BranchesTab({ owner, repo, defaultBranch, onDefaultBranchChange }: BranchesTabProps) {
  const { api, t, showToast, confirm } = useApp();
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.branches.listBranches(owner, repo);
      setBranches(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [owner, repo]);

  const handleDelete = async (branch: GitHubBranch) => {
    if (branch.name === defaultBranch) {
      await confirm({
        title: t('common.warning'),
        message: t('branches.delete.title') + ' — ' + t('branches.delete.warning', { name: branch.name }),
        severity: 'info',
        confirmLabel: 'OK',
      });
      return;
    }

    let comparison;
    try {
      comparison = await api!.branches.compareBranches(owner, repo, defaultBranch, branch.name);
    } catch { /* ignore */ }

    const msg = (comparison?.ahead_by ?? 0) > 0
      ? t('branches.delete.warning', { name: branch.name }) + '\n\n' + t('branches.delete.unmergedWarning', { count: String(comparison?.ahead_by) })
      : t('branches.delete.warning', { name: branch.name });

    const result = await confirm({
      title: t('branches.delete.title'),
      message: msg,
      severity: (comparison?.ahead_by ?? 0) > 0 ? 'danger' : 'warning',
      confirmLabel: t('common.delete'),
    });
    if (!result.confirmed) return;

    try {
      await api!.branches.deleteBranch(owner, repo, branch.name);
      setBranches((prev) => prev.filter((b) => b.name !== branch.name));
      showToast('success', `Branche "${branch.name}" supprimée`);
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const handleSetDefault = async (branch: GitHubBranch) => {
    const result = await confirm({
      title: t('branches.setDefault.title'),
      message: t('branches.setDefault.warning', { name: branch.name }),
      severity: 'warning',
      confirmLabel: t('common.confirm'),
    });
    if (!result.confirmed) return;

    try {
      await api!.repos.updateRepo(owner, repo, { default_branch: branch.name });
      onDefaultBranchChange(branch.name);
      showToast('success', `"${branch.name}" est maintenant la branche principale`);
    } catch {
      showToast('error', t('common.error'));
    }
  };

  if (error) return <ErrorMessage error={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-300">{t('branches.title')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('branches.whatIsBranch')}</p>
        </div>
        <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
          {t('branches.newBranch')}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : branches.length === 0 ? (
        <EmptyState icon={<GitBranch size={22} />} title={t('branches.noBranches')} />
      ) : (
        <div className="space-y-2">
          {branches.map((branch) => {
            const isDefault = branch.name === defaultBranch;
            return (
              <div
                key={branch.name}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors
                  ${isDefault ? 'bg-sky-500/5 border-sky-500/20' : 'bg-slate-900 border-slate-800'}`}
              >
                <GitBranch size={16} className={isDefault ? 'text-sky-400' : 'text-slate-500'} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${isDefault ? 'text-sky-400' : 'text-slate-200'}`}>
                      {branch.name}
                    </span>
                    {isDefault && (
                      <Badge variant="info" size="sm">{t('branches.default')}</Badge>
                    )}
                    {branch.protected && (
                      <Badge variant="warning" size="sm">
                        <Shield size={10} /> {t('branches.protected')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-mono truncate mt-0.5">{branch.commit.sha.slice(0, 8)}</p>
                </div>
                {!isDefault && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSetDefault(branch)}
                      className="p-1.5 text-slate-600 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-colors"
                      title={t('branches.setDefaultBtn')}
                    >
                      <Check size={14} />
                    </button>
                    {!branch.protected && (
                      <button
                        onClick={() => handleDelete(branch)}
                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title={t('branches.deleteBranch')}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {createOpen && (
        <CreateBranchModal
          owner={owner}
          repo={repo}
          branches={branches}
          defaultBranch={defaultBranch}
          onClose={() => setCreateOpen(false)}
          onCreated={(b) => { setBranches((prev) => [...prev, b]); setCreateOpen(false); }}
        />
      )}
    </div>
  );
}

function CreateBranchModal({
  owner, repo, branches, defaultBranch, onClose, onCreated,
}: {
  owner: string; repo: string; branches: GitHubBranch[]; defaultBranch: string;
  onClose: () => void; onCreated: (b: GitHubBranch) => void;
}) {
  const { api, t, showToast } = useApp();
  const [name, setName] = useState('');
  const [from, setFrom] = useState(defaultBranch);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) { setNameError(t('common.required')); return; }
    if (!/^[a-zA-Z0-9_./-]+$/.test(name)) { setNameError('Nom invalide'); return; }

    setLoading(true);
    try {
      const sourceBranch = branches.find((b) => b.name === from);
      if (!sourceBranch) throw new Error('Branch not found');
      await api!.branches.createBranch(owner, repo, name, sourceBranch.commit.sha);
      const newBranch: GitHubBranch = { name, commit: { sha: sourceBranch.commit.sha, url: '' }, protected: false };
      showToast('success', `Branche "${name}" créée`);
      onCreated(newBranch);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t('branches.newBranch')} size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleCreate} disabled={!name.trim()}>
            {t('common.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg">
          <p className="text-xs text-sky-300">{t('branches.whatIsBranch')}</p>
        </div>
        <Input
          label={t('common.name')}
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(''); }}
          placeholder={t('branches.namePlaceholder')}
          error={nameError}
          required
        />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('branches.from')}</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {branches.map((b) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}
