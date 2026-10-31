import { useEffect, useState } from 'react';
import {
  Plus, Search, Star, GitFork, AlertCircle,
  Lock, FolderGit2, Archive,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { SkeletonList } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import type { GitHubRepo } from '../../types';

type Filter = 'all' | 'public' | 'private' | 'fork';
type Sort = 'updated' | 'pushed' | 'full_name';

export function RepositoriesPage() {
  const { api, t, navigate, showToast, confirm, language } = useApp();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort] = useState<Sort>('updated');
  const [createOpen, setCreateOpen] = useState(false);

  const load = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.repos.listRepos(1, sort);
      setRepos(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [api, sort]);

  const filtered = repos.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'public' && !r.private) ||
      (filter === 'private' && r.private) ||
      (filter === 'fork' && r.fork);
    return matchSearch && matchFilter;
  });

  const timeAgo = (date: string): string => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
    return `${t('repos.updatedAt')} ${rtf.format(-days, 'day')}`;
  };

  const handleDelete = async (repo: GitHubRepo) => {
    const result = await confirm({
      title: t('repos.delete.title'),
      message: t('repos.delete.warning', { name: repo.full_name }),
      severity: 'danger',
      confirmLabel: t('common.delete'),
      requireTyping: repo.name,
    });
    if (!result.confirmed) return;
    try {
      await api!.repos.deleteRepo(repo.owner.login, repo.name);
      setRepos((prev) => prev.filter((r) => r.id !== repo.id));
      showToast('success', `"${repo.name}" supprimé`);
    } catch {
      showToast('error', t('common.error'));
    }
  };

  return (
    <div className="flex flex-col">
      <Header
        title={t('repos.title')}
        subtitle={`${repos.length} ${t('repos.title').toLowerCase()}`}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setCreateOpen(true)}
          >
            {t('repos.newRepo')}
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('repos.search')}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'public', 'private', 'fork'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${filter === f ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600'}`}
              >
                {t(`repos.filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <ErrorMessage error={error} onRetry={load} />
        ) : loading ? (
          <SkeletonList count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FolderGit2 size={24} />}
            title={t('repos.noRepos')}
            description={t('repos.noReposHint')}
            action={{ label: t('repos.newRepo'), onClick: () => setCreateOpen(true), icon: <Plus size={14} /> }}
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
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sky-400 group-hover:text-sky-300 transition-colors text-sm">
                          {repo.name}
                        </span>
                        {repo.private && (
                          <span className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                            <Lock size={10} /> {t('common.private')}
                          </span>
                        )}
                        {repo.fork && (
                          <span className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                            <GitFork size={10} /> fork
                          </span>
                        )}
                        {repo.archived && (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                            <Archive size={10} /> {t('common.archived')}
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-1">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                            {repo.language}
                          </span>
                        )}
                        {repo.stargazers_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Star size={11} /> {repo.stargazers_count}
                          </span>
                        )}
                        {repo.forks_count > 0 && (
                          <span className="flex items-center gap-1">
                            <GitFork size={11} /> {repo.forks_count}
                          </span>
                        )}
                        {repo.open_issues_count > 0 && (
                          <span className="flex items-center gap-1">
                            <AlertCircle size={11} /> {repo.open_issues_count}
                          </span>
                        )}
                        <span>{timeAgo(repo.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(repo); }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0"
                    title={t('repos.delete.title')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {createOpen && <CreateRepoModal onClose={() => setCreateOpen(false)} onCreated={(r) => {
        setRepos((prev) => [r, ...prev]);
        setCreateOpen(false);
        navigate({ name: 'repository', owner: r.owner.login, repo: r.name, tab: 'files' });
      }} />}
    </div>
  );
}

function CreateRepoModal({ onClose, onCreated }: { onClose: () => void; onCreated: (r: GitHubRepo) => void }) {
  const { api, t, showToast, confirm } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [init, setInit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) { setNameError(t('common.required')); return; }
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) { setNameError('Nom invalide (lettres, chiffres, tirets, points)'); return; }

    if (!isPrivate) {
      const result = await confirm({
        title: t('common.warning'),
        message: t('repos.create.publicWarning'),
        severity: 'warning',
        confirmLabel: t('repos.create.publicLabel'),
      });
      if (!result.confirmed) return;
    }

    setLoading(true);
    try {
      const repo = await api!.repos.createRepo({
        name: name.trim(),
        description: description.trim() || undefined,
        private: isPrivate,
        auto_init: init,
      });
      showToast('success', `"${repo.name}" créé !`);
      onCreated(repo);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t('repos.create.title')}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleCreate}>{t('common.create')}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label={t('common.name')}
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(''); }}
          placeholder={t('repos.create.namePlaceholder')}
          hint={t('repos.create.nameHelp')}
          error={nameError}
          required
        />
        <Textarea
          label={t('common.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('repos.create.descriptionPlaceholder')}
          rows={2}
        />
        <div>
          <p className="text-sm font-medium text-slate-300 mb-2">{t('repos.create.visibility')}</p>
          <div className="space-y-2">
            {[
              { value: false, label: t('repos.create.publicLabel'), hint: t('repos.create.publicHint') },
              { value: true, label: t('repos.create.privateLabel'), hint: t('repos.create.privateHint') },
            ].map(({ value, label, hint }) => (
              <label
                key={String(value)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                  ${isPrivate === value ? 'border-sky-500/50 bg-sky-500/10' : 'border-slate-700 hover:border-slate-600'}`}
              >
                <input
                  type="radio"
                  checked={isPrivate === value}
                  onChange={() => setIsPrivate(value)}
                  className="mt-0.5 accent-sky-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
          <input
            type="checkbox"
            checked={init}
            onChange={(e) => setInit(e.target.checked)}
            className="mt-0.5 accent-sky-500"
          />
          <div>
            <p className="text-sm font-medium text-slate-200">{t('repos.create.initRepo')}</p>
            <p className="text-xs text-slate-500 mt-0.5">{t('repos.create.initHint')}</p>
          </div>
        </label>
      </div>
    </Modal>
  );
}
