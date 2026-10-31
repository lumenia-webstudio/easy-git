import { useState } from 'react';
import { Save, Archive, Trash2, AlertTriangle, Globe, Lock, BookOpen, Kanban } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import type { GitHubRepo } from '../../types';

interface Props {
  owner: string;
  repo: string;
  repoData: GitHubRepo;
  onRepoUpdated: (repo: GitHubRepo) => void;
}

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon: React.ReactNode;
}

function FeatureToggle({ label, description, checked, onChange, icon }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-400">{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-200">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${checked ? 'bg-sky-500' : 'bg-slate-700'}`}
        style={{ height: '22px' }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

export function RepoSettingsTab({ owner, repo, repoData, onRepoUpdated }: Props) {
  const { api, t, navigate, showToast, confirm } = useApp();

  const [name, setName] = useState(repoData.name);
  const [description, setDescription] = useState(repoData.description ?? '');
  const [hasIssues, setHasIssues] = useState((repoData as unknown as Record<string, boolean>).has_issues ?? true);
  const [hasProjects, setHasProjects] = useState((repoData as unknown as Record<string, boolean>).has_projects ?? true);
  const [hasWiki, setHasWiki] = useState((repoData as unknown as Record<string, boolean>).has_wiki ?? true);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleSaveGeneral = async () => {
    if (!name.trim()) { setNameError(t('common.required')); return; }
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
      setNameError('Invalid name (letters, numbers, hyphens, dots)');
      return;
    }
    setSavingGeneral(true);
    try {
      const updated = await api!.repos.updateRepo(owner, repo, {
        name: name.trim(),
        description: description.trim() || undefined,
        has_issues: hasIssues,
        has_projects: hasProjects,
        has_wiki: hasWiki,
      });
      onRepoUpdated(updated);
      showToast('success', t('repoSettings.saved'));
      if (name.trim() !== repo) {
        navigate({ name: 'repository', owner, repo: name.trim(), tab: 'repoSettings' });
      }
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleVisibilityChange = async (makePrivate: boolean) => {
    const result = await confirm({
      title: makePrivate ? t('repoSettings.makePrivate') : t('repoSettings.makePublic'),
      message: makePrivate ? t('repoSettings.makePrivateConfirm') : t('repoSettings.makePublicConfirm'),
      severity: 'warning',
      confirmLabel: makePrivate ? t('repoSettings.makePrivate') : t('repoSettings.makePublic'),
    });
    if (!result.confirmed) return;
    try {
      const updated = await api!.repos.updateRepo(owner, repo, { private: makePrivate });
      onRepoUpdated(updated);
      showToast('success', t('repoSettings.saved'));
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const handleArchive = async () => {
    const result = await confirm({
      title: t('repos.archive.title'),
      message: t('repos.archive.warning'),
      severity: 'warning',
      confirmLabel: t('common.confirm'),
    });
    if (!result.confirmed) return;
    try {
      const updated = await api!.repos.updateRepo(owner, repo, { archived: true });
      onRepoUpdated(updated);
      showToast('success', `"${repo}" archived`);
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const handleDelete = async () => {
    const result = await confirm({
      title: t('repos.delete.title'),
      message: t('repos.delete.warning', { name: `${owner}/${repo}` }),
      severity: 'danger',
      confirmLabel: t('common.delete'),
      requireTyping: repo,
    });
    if (!result.confirmed) return;
    try {
      await api!.repos.deleteRepo(owner, repo);
      showToast('success', `"${repo}" deleted`);
      navigate({ name: 'repositories' });
    } catch {
      showToast('error', t('common.error'));
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-100">{t('repoSettings.general')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('repoSettings.generalDesc')}</p>
        </div>

        <div className="space-y-4">
          <Input
            label={t('repoSettings.name')}
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            placeholder={t('repoSettings.namePlaceholder')}
            error={nameError}
          />
          <Textarea
            label={t('repoSettings.description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('repoSettings.descriptionPlaceholder')}
            rows={2}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('repoSettings.features')}</h4>
          <div className="divide-y divide-slate-800">
            <FeatureToggle
              label={t('repoSettings.hasIssues')}
              description={t('repoSettings.hasIssuesDesc')}
              checked={hasIssues}
              onChange={setHasIssues}
              icon={<AlertTriangle size={16} />}
            />
            <FeatureToggle
              label={t('repoSettings.hasProjects')}
              description={t('repoSettings.hasProjectsDesc')}
              checked={hasProjects}
              onChange={setHasProjects}
              icon={<Kanban size={16} />}
            />
            <FeatureToggle
              label={t('repoSettings.hasWiki')}
              description={t('repoSettings.hasWikiDesc')}
              checked={hasWiki}
              onChange={setHasWiki}
              icon={<BookOpen size={16} />}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            icon={<Save size={14} />}
            loading={savingGeneral}
            onClick={handleSaveGeneral}
          >
            {t('common.save')}
          </Button>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-100">{t('repoSettings.visibility')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('repoSettings.visibilityDesc')}</p>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
          <div className="flex items-center gap-3">
            {repoData.private ? (
              <Lock size={16} className="text-slate-400 shrink-0" />
            ) : (
              <Globe size={16} className="text-sky-400 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-200">
                {repoData.private ? t('common.private') : t('common.public')}
              </p>
              <p className="text-xs text-slate-500">
                {repoData.private ? t('repoSettings.makePrivateDesc') : t('repoSettings.makePublicDesc')}
              </p>
            </div>
          </div>
          {!repoData.archived && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVisibilityChange(!repoData.private)}
            >
              {repoData.private ? t('repoSettings.makePublic') : t('repoSettings.makePrivate')}
            </Button>
          )}
        </div>
      </section>

      <section className="bg-slate-900 border border-red-500/20 rounded-xl p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <AlertTriangle size={14} />
            {t('repoSettings.dangerZone')}
          </h3>
        </div>

        <div className="space-y-3">
          {!repoData.archived && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 hover:border-amber-500/30 transition-colors">
              <div className="flex items-start gap-3">
                <Archive size={15} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-200">{t('repoSettings.archiveRepo')}</p>
                  <p className="text-xs text-slate-500">{t('repoSettings.archiveRepoDesc')}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleArchive}>
                <span className="text-amber-400">{t('repos.archive.title')}</span>
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 hover:border-red-500/30 transition-colors">
            <div className="flex items-start gap-3">
              <Trash2 size={15} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-200">{t('repoSettings.deleteRepo')}</p>
                <p className="text-xs text-slate-500">{t('repoSettings.deleteRepoDesc')}</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
