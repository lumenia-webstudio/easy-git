import { useState } from 'react';
import { Sun, Moon, Trash2, Plus, Check, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { createGitHubAPI } from '../../services/github';
import { storage } from '../../services/storage';
import type { Account } from '../../types';


function SectionRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-section)' }}>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const {
    t, language, setLanguage, theme, setTheme,
    accounts, activeAccount, removeAccount, setActiveAccount, navigate, confirm, showToast,
  } = useApp();
  const [addOpen, setAddOpen] = useState(false);

  const handleRemoveAccount = async (account: Account) => {
    const result = await confirm({
      title: t('settings.removeAccount'),
      message: t('settings.removeAccountWarning', { name: account.username }),
      severity: 'warning',
      confirmLabel: t('common.remove'),
    });
    if (!result.confirmed) return;
    removeAccount(account.id);
    showToast('info', `Compte "${account.username}" retiré`);
    if (accounts.length <= 1) navigate({ name: 'dashboard' });
  };

  const handleClearData = async () => {
    const result = await confirm({
      title: t('settings.clearData'),
      message: t('settings.clearDataWarning'),
      severity: 'danger',
      confirmLabel: t('settings.clearData'),
    });
    if (!result.confirmed) return;
    storage.clearAll();
    window.location.reload();
  };

  return (
    <div className="flex flex-col">
      <Header title={t('settings.title')} />

      <div className="p-6 max-w-xl space-y-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            {t('settings.appearance')}
          </h2>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)' }}>
            <SectionRow>
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('settings.language')}</span>
              <div className="flex gap-1.5">
                {(['fr', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all"
                    style={language === lang ? {
                      background: 'var(--gold-active-bg)',
                      color: 'var(--gold)',
                      border: '1px solid var(--gold-border)',
                    } : {
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </SectionRow>

            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('settings.theme')}</span>
              <div
                className="flex rounded-lg p-0.5"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
              >
                <button
                  onClick={() => setTheme('dark')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all"
                  style={theme === 'dark' ? {
                    background: 'var(--gold-active-bg)',
                    color: 'var(--gold)',
                    border: '1px solid var(--gold-border)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  } : {
                    color: 'var(--text-muted)',
                    border: '1px solid transparent',
                  }}
                >
                  <Moon size={13} />
                  <span>{t('settings.themeDark')}</span>
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all"
                  style={theme === 'light' ? {
                    background: 'var(--gold-active-bg)',
                    color: 'var(--gold)',
                    border: '1px solid var(--gold-border)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  } : {
                    color: 'var(--text-muted)',
                    border: '1px solid transparent',
                  }}
                >
                  <Sun size={13} />
                  <span>{t('settings.themeLight')}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {t('settings.accounts')}
            </h2>
            <Button size="sm" variant="secondary" icon={<Plus size={13} />} onClick={() => setAddOpen(true)}>
              {t('settings.addAccount')}
            </Button>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)' }}>
            {accounts.map((acc, idx) => {
              const isActive = acc.id === activeAccount?.id;
              return (
                <div
                  key={acc.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: idx < accounts.length - 1 ? '1px solid var(--border-section)' : undefined }}
                >
                  <Avatar src={acc.avatarUrl} name={acc.username} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {acc.name ?? acc.username}
                      </span>
                      {isActive && <Badge variant="info" size="sm">{t('settings.activeAccount')}</Badge>}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>@{acc.username}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!isActive && (
                      <button
                        onClick={() => setActiveAccount(acc)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
                        style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                          (e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover-bg)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                          (e.currentTarget as HTMLElement).style.background = '';
                        }}
                      >
                        <Check size={12} /> {t('settings.switchTo')}
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveAccount(acc)}
                      className={`p-1.5 rounded-lg transition-colors ${isActive && accounts.length === 1 ? 'cursor-not-allowed' : 'hover:text-red-400 hover:bg-red-400/10'}`}
                      style={{ color: isActive && accounts.length === 1 ? 'var(--border-color)' : 'var(--text-muted)' }}
                      disabled={isActive && accounts.length === 1}
                      title={t('settings.removeAccount')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            {t('settings.about')}
          </h2>
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'var(--bg-card)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)' }}
          >
            <div className="flex items-start gap-2">
              <Info size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t('settings.aboutText')}</p>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Easy Git v{__APP_VERSION__} — {t('brand.by')}{' '}
              <a href="https://lumeniawebstudio.com" target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">Lumenia Web Studio</a></p>
          </div>
        </section>

        <section>
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('settings.clearData')}</h3>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{t('settings.clearDataWarning')}</p>
                <Button size="sm" variant="danger" onClick={handleClearData}>
                  {t('settings.clearData')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {addOpen && (
        <AddAccountModal
          onClose={() => setAddOpen(false)}
          onAdded={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}

function AddAccountModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const { t, addAccount, showToast } = useApp();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setError('');
    try {
      const api = createGitHubAPI(token.trim());
      const user = await api.users.getAuthenticatedUser();
      const account: Account = {
        id: String(user.id),
        username: user.login,
        token: token.trim(),
        avatarUrl: user.avatar_url,
        name: user.name,
        addedAt: new Date().toISOString(),
      };
      addAccount(account);
      showToast('success', t('auth.accountAdded', { name: user.login }));
      onAdded();
    } catch {
      setError(t('auth.invalidToken'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={t('settings.addAccount')} size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>{t('common.cancel')}</Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleAdd} disabled={!token.trim()}>
            {t('common.add')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          label={t('auth.tokenLabel')}
          type="password"
          value={token}
          onChange={(e) => { setToken(e.target.value); setError(''); }}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder={t('auth.tokenPlaceholder')}
          hint={t('auth.tokenHelp')}
          error={error}
        />
      </div>
    </Modal>
  );
}
