import { useEffect, useState } from 'react';
import { Tag, Plus, Download, Trash2, Package, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { MarkdownViewer } from '../../components/ui/MarkdownViewer';
import type { GitHubRelease, GitHubBranch } from '../../types';

interface ReleasesPageProps {
  owner: string;
  repo: string;
}

export function ReleasesPage({ owner, repo }: ReleasesPageProps) {
  const { api, t, showToast, confirm } = useApp();
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.releases.listReleases(owner, repo);
      setReleases(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [owner, repo]);

  const handleDelete = async (release: GitHubRelease) => {
    const result = await confirm({
      title: t('releases.delete.title'),
      message: t('releases.delete.warning', { name: release.name ?? release.tag_name }),
      severity: 'danger',
      confirmLabel: t('common.delete'),
    });
    if (!result.confirmed) return;
    try {
      await api!.releases.deleteRelease(owner, repo, release.id);
      setReleases((prev) => prev.filter((r) => r.id !== release.id));
      showToast('success', `Version "${release.tag_name}" supprimée`);
    } catch {
      showToast('error', t('common.error'));
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (error) return <ErrorMessage error={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300">{t('releases.title')}</h2>
        <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
          {t('releases.newRelease')}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : releases.length === 0 ? (
        <EmptyState
          icon={<Tag size={22} />}
          title={t('releases.noReleases')}
          description={t('releases.noReleasesHint')}
          action={{ label: t('releases.newRelease'), onClick: () => setCreateOpen(true), icon: <Plus size={14} /> }}
        />
      ) : (
        <div className="space-y-3">
          {releases.map((release, idx) => (
            <div
              key={release.id}
              className={`bg-slate-900 border rounded-xl overflow-hidden
                ${idx === 0 && !release.prerelease && !release.draft ? 'border-sky-500/20' : 'border-slate-800'}`}
            >
              <div className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <Avatar src={release.author.avatar_url} name={release.author.login} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-100">
                        {release.name ?? release.tag_name}
                      </span>
                      <code className="text-xs font-mono bg-slate-800 text-sky-400 px-2 py-0.5 rounded border border-slate-700">
                        {release.tag_name}
                      </code>
                      {idx === 0 && !release.prerelease && !release.draft && (
                        <Badge variant="info" size="sm">{t('releases.latest')}</Badge>
                      )}
                      {release.prerelease && <Badge variant="warning" size="sm">{t('releases.preRelease')}</Badge>}
                      {release.draft && <Badge variant="draft" size="sm">{t('releases.draft')}</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {release.author.login} — {formatDate(release.published_at ?? release.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={release.zipball_url}
                      className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                      title={t('releases.downloadZip')}
                    >
                      <Download size={14} />
                    </a>
                    <button
                      onClick={() => handleDelete(release)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => setExpanded(expanded === release.id ? null : release.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs"
                    >
                      {expanded === release.id ? t('common.less') : t('common.more')}
                    </button>
                  </div>
                </div>
              </div>

              {expanded === release.id && (
                <div className="px-5 pb-4 border-t border-slate-800 space-y-3 pt-4">
                  {release.body && (
                    <MarkdownViewer content={release.body} />
                  )}
                  {release.assets.length > 0 ? (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 mb-2">{t('releases.assets')}</h4>
                      <div className="space-y-1.5">
                        {release.assets.map((asset) => (
                          <a
                            key={asset.id}
                            href={asset.browser_download_url}
                            className="flex items-center gap-3 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
                          >
                            <Package size={14} className="text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-slate-200 truncate">{asset.name}</p>
                              <p className="text-xs text-slate-500">{formatSize(asset.size)} — {asset.download_count} {t('releases.downloads')}</p>
                            </div>
                            <Download size={12} className="text-slate-500 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">{t('releases.noAssets')}</p>
                  )}
                  <div className="flex gap-2">
                    <a href={release.zipball_url} className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                      <Download size={12} /> {t('releases.downloadZip')}
                    </a>
                    <a href={release.tarball_url} className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
                      <Download size={12} /> {t('releases.downloadTar')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {createOpen && (
        <CreateReleaseModal
          owner={owner}
          repo={repo}
          onClose={() => setCreateOpen(false)}
          onCreated={(r) => { setReleases((prev) => [r, ...prev]); setCreateOpen(false); }}
        />
      )}
    </div>
  );
}

function CreateReleaseModal({ owner, repo, onClose, onCreated }: {
  owner: string; repo: string; onClose: () => void; onCreated: (r: GitHubRelease) => void;
}) {
  const { api, t, showToast } = useApp();
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [tag, setTag] = useState('');
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  const [isPreRelease, setIsPreRelease] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tagError, setTagError] = useState('');

  useEffect(() => {
    api!.branches.listBranches(owner, repo).then((b) => {
      setBranches(b);
      if (b.length > 0) setTargetBranch(b[0].name);
    }).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!tag.trim()) { setTagError(t('common.required')); return; }
    if (!/^v?\d+/.test(tag)) { setTagError('Format invalide (ex: v1.0.0)'); return; }

    setLoading(true);
    try {
      const release = await api!.releases.createRelease(owner, repo, {
        tag_name: tag.trim(),
        name: name.trim() || undefined,
        body: body.trim() || undefined,
        target_commitish: targetBranch || undefined,
        prerelease: isPreRelease,
        draft: isDraft,
      });
      showToast('success', `Version "${release.tag_name}" ${isDraft ? 'enregistrée' : 'publiée'} !`);
      onCreated(release);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t('releases.create.title')} size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleCreate} disabled={!tag.trim()}>
            {isDraft ? t('common.save') : t('releases.newRelease')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-lg flex items-start gap-2">
          <AlertTriangle size={14} className="text-sky-400 mt-0.5 shrink-0" />
          <p className="text-xs text-sky-300">
            {isPreRelease ? t('releases.create.preReleaseHint') : 'Cette version sera visible publiquement.'}
          </p>
        </div>
        <Input
          label={t('releases.create.tagVersion')}
          value={tag}
          onChange={(e) => { setTag(e.target.value); setTagError(''); }}
          placeholder={t('releases.create.tagPlaceholder')}
          hint={t('releases.create.tagHelp')}
          error={tagError}
          required
        />
        <Input
          label={t('releases.create.releaseName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('releases.create.releaseNamePlaceholder')}
        />
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('releases.create.targetBranch')}</label>
          <select value={targetBranch} onChange={(e) => setTargetBranch(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500">
            {branches.map((b) => <option key={b.name}>{b.name}</option>)}
          </select>
        </div>
        <Textarea
          label={t('common.description')}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('releases.create.bodyPlaceholder')}
          rows={5}
        />
        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
            <input type="checkbox" checked={isPreRelease} onChange={(e) => setIsPreRelease(e.target.checked)} className="mt-0.5 accent-amber-500" />
            <div>
              <p className="text-sm font-medium text-slate-200">{t('releases.create.isPreRelease')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('releases.create.preReleaseHint')}</p>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
            <input type="checkbox" checked={isDraft} onChange={(e) => setIsDraft(e.target.checked)} className="mt-0.5 accent-sky-500" />
            <div>
              <p className="text-sm font-medium text-slate-200">{t('releases.create.isDraft')}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('releases.create.draftHint')}</p>
            </div>
          </label>
        </div>
      </div>
    </Modal>
  );
}
