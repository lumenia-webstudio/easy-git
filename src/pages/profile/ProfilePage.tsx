import { useEffect, useState } from 'react';
import { MapPin, Link2, Building2, Twitter, Mail, ExternalLink, CreditCard as Edit3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import type { GitHubUser } from '../../types';

export function ProfilePage() {
  const { api, t } = useApp();
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const u = await api.users.getAuthenticatedUser();
      setUser(u);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [api]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });

  if (error) return (
    <div className="flex flex-col">
      <Header title={t('profile.title')} />
      <div className="p-6"><ErrorMessage error={error} onRetry={load} /></div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <Header
        title={t('profile.title')}
        actions={
          <Button size="sm" variant="secondary" icon={<Edit3 size={14} />} onClick={() => setEditOpen(true)}>
            {t('profile.editProfile')}
          </Button>
        }
      />

      <div className="p-6 max-w-2xl">
        {loading ? (
          <ProfileSkeleton />
        ) : user && (
          <div className="space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-start gap-5">
                <Avatar src={user.avatar_url} name={user.name ?? user.login} size="xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-bold text-slate-100">
                        {user.name ?? user.login}
                      </h1>
                      <p className="text-slate-500 text-sm">@{user.login}</p>
                    </div>
                    <a
                      href={`https://github.com/${user.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors shrink-0"
                    >
                      <ExternalLink size={12} />
                      {t('profile.viewOnGitHub')}
                    </a>
                  </div>

                  {user.bio ? (
                    <p className="text-sm text-slate-300 mt-3 leading-relaxed">{user.bio}</p>
                  ) : (
                    <p className="text-sm text-slate-600 mt-3 italic">{t('profile.noBio')}</p>
                  )}

                  <div className="mt-4 space-y-1.5">
                    {user.company && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Building2 size={14} className="text-slate-600 shrink-0" />
                        {user.company}
                      </div>
                    )}
                    {user.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <MapPin size={14} className="text-slate-600 shrink-0" />
                        {user.location}
                      </div>
                    )}
                    {user.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Mail size={14} className="text-slate-600 shrink-0" />
                        <a href={`mailto:${user.email}`} className="hover:text-sky-400 transition-colors">{user.email}</a>
                      </div>
                    )}
                    {user.blog && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Link2 size={14} className="text-slate-600 shrink-0" />
                        <a href={user.blog} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors truncate">
                          {user.blog}
                        </a>
                      </div>
                    )}
                    {user.twitter_username && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Twitter size={14} className="text-slate-600 shrink-0" />
                        <a href={`https://twitter.com/${user.twitter_username}`} target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors">
                          @{user.twitter_username}
                        </a>
                      </div>
                    )}
                    <p className="text-xs text-slate-600 pt-1">
                      {t('profile.joinedOn')} {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: t('profile.repos'), value: user.public_repos },
                { label: t('profile.followers'), value: user.followers },
                { label: t('profile.following'), value: user.following },
                { label: 'Gists', value: user.public_gists },
              ].map((s) => (
                <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-100">{s.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editOpen && user && (
        <EditProfileModal
          user={user}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => { setUser(updated); setEditOpen(false); }}
        />
      )}
    </div>
  );
}

function EditProfileModal({ user, onClose, onSaved }: {
  user: GitHubUser; onClose: () => void; onSaved: (u: GitHubUser) => void;
}) {
  const { api, t, showToast } = useApp();
  const [name, setName] = useState(user.name ?? '');
  const [bio, setBio] = useState(user.bio ?? '');
  const [location, setLocation] = useState(user.location ?? '');
  const [blog, setBlog] = useState(user.blog ?? '');
  const [company, setCompany] = useState(user.company ?? '');
  const [twitter, setTwitter] = useState(user.twitter_username ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await api!.users.updateAuthenticatedUser({
        name: name.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        blog: blog.trim() || undefined,
        company: company.trim() || undefined,
        twitter_username: twitter.trim() || undefined,
      });
      showToast('success', t('profile.edit.saved'));
      onSaved(updated);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t('profile.edit.title')} size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleSave}>{t('common.save')}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label={t('common.name')} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('profile.edit.namePlaceholder')} />
        <Textarea label={t('profile.bio')} value={bio} onChange={(e) => setBio(e.target.value)} placeholder={t('profile.edit.bioPlaceholder')} rows={3} />
        <Input label={t('profile.company')} value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t('profile.edit.companyPlaceholder')} prefix={<Building2 size={14} />} />
        <Input label={t('profile.location')} value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('profile.edit.locationPlaceholder')} prefix={<MapPin size={14} />} />
        <Input label={t('profile.website')} value={blog} onChange={(e) => setBlog(e.target.value)} placeholder={t('profile.edit.websitePlaceholder')} prefix={<Link2 size={14} />} />
        <Input label={t('profile.twitter')} value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder={t('profile.edit.twitterPlaceholder')} prefix={<Twitter size={14} />} />
      </div>
    </Modal>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex gap-5">
          <Skeleton className="w-20 h-20 rounded-full shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    </div>
  );
}
