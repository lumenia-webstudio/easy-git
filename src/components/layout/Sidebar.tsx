import { useEffect, useState } from 'react';
import {
  LayoutDashboard, FolderGit2, GitPullRequest,
  User, Settings, ChevronDown, Plus, LogOut, Check,
  Menu, X, Bell, Star, Keyboard, BookOpen, TerminalSquare, HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import type { Page } from '../../types';
import logoImg from '../../assets/easy-git-icon.svg';

const navItems = (t: (k: string) => string): Array<{
  page: Page;
  icon: React.ReactNode;
  label: string;
}> => [
  { page: { name: 'dashboard' }, icon: <LayoutDashboard size={16} />, label: t('nav.dashboard') },
  { page: { name: 'repositories' }, icon: <FolderGit2 size={16} />, label: t('nav.repositories') },
  { page: { name: 'starred' }, icon: <Star size={16} />, label: t('starred.title') },
  { page: { name: 'notifications' }, icon: <Bell size={16} />, label: t('nav.notifications') },
  {
    page: { name: 'repository', owner: '', repo: '', tab: 'pulls' } as Page,
    icon: <GitPullRequest size={16} />,
    label: t('nav.pullRequests'),
  },
  { page: { name: 'profile' }, icon: <User size={16} />, label: t('nav.profile') },
  { page: { name: 'settings' }, icon: <Settings size={16} />, label: t('nav.settings') },
  { page: { name: 'gitref' }, icon: <BookOpen size={16} />, label: t('nav.gitref') },
  { page: { name: 'terminal' }, icon: <TerminalSquare size={16} />, label: t('nav.terminal') },
  { page: { name: 'help' }, icon: <HelpCircle size={16} />, label: t('nav.help') },
];

interface SidebarProps {
  onOpenShortcuts?: () => void;
}

export function Sidebar({ onOpenShortcuts }: SidebarProps) {
  const { t, currentPage, navigate, accounts, activeAccount, setActiveAccount, removeAccount, api } = useApp();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    api.notifications.getUnreadCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, [api]);

  const isActive = (page: Page) => page.name === currentPage.name;
  const items = navItems(t);

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-sidebar)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-8 h-8 shrink-0"
          >
            <img src={logoImg} alt="Easy Git" className="w-full h-full" />
          </div>
          <div>
            <p className="text-xs font-black tracking-widest uppercase" style={{
              background: 'linear-gradient(135deg, #f9cf47 0%, var(--gold) 50%, #a86c0f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Easy Git
            </p>
            <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>{t('brand.tagline')}</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--border-sidebar)' }}>
        <button
          onClick={() => setAccountOpen(!accountOpen)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors"
          style={{ background: accountOpen ? 'var(--gold-bg)' : undefined }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--gold-bg)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = accountOpen ? 'var(--gold-bg)' : '')}
        >
          <Avatar src={activeAccount?.avatarUrl} name={activeAccount?.username} size="sm" />
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {activeAccount?.name ?? activeAccount?.username ?? '—'}
            </p>
            {activeAccount?.username && (
              <p className="text-xs truncate" style={{ color: 'var(--gold-dim)' }}>@{activeAccount.username}</p>
            )}
          </div>
          <ChevronDown
            size={13}
            className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--gold-faint)' }}
          />
        </button>

        {accountOpen && (
          <div className="mt-1 space-y-0.5 animate-in fade-in duration-150">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-center gap-1 group">
                <button
                  onClick={() => { setActiveAccount(acc); setAccountOpen(false); }}
                  className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover-bg)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
                >
                  <Avatar src={acc.avatarUrl} name={acc.username} size="xs" />
                  <span className="text-xs truncate flex-1">{acc.username}</span>
                  {acc.id === activeAccount?.id && (
                    <Check size={12} style={{ color: 'var(--gold)' }} className="shrink-0" />
                  )}
                </button>
                {acc.id !== activeAccount?.id && (
                  <button
                    onClick={() => removeAccount(acc.id)}
                    className="p-1 rounded hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: 'var(--text-muted)' }}
                    title={t('settings.removeAccount')}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => { navigate({ name: 'settings' }); setAccountOpen(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors text-left"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover-bg)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '')}
            >
              <Plus size={13} />
              <span className="text-xs">{t('nav.addAccount')}</span>
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const active = isActive(item.page);
          const onClick = item.page.name === 'repository' && (item.page as { owner: string }).owner === ''
            ? () => {}
            : () => { navigate(item.page); setMobileOpen(false); };
          const isNotifications = item.page.name === 'notifications';

          return (
            <button
              key={item.page.name + (item.page.name === 'repository' ? (item.page as { tab: string }).tab : '')}
              onClick={onClick}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all text-left"
              style={active ? {
                background: 'var(--gold-active-bg)',
                color: 'var(--gold)',
                fontWeight: 600,
                boxShadow: 'inset 2px 0 0 var(--gold-nav-border)',
              } : {
                color: 'var(--nav-item-color)',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover-bg)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--nav-item-hover-color)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = '';
                  (e.currentTarget as HTMLElement).style.color = 'var(--nav-item-color)';
                }
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {isNotifications && unreadCount > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] leading-none shrink-0 font-semibold"
                  style={{ background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3 space-y-0.5" style={{ borderTop: '1px solid var(--border-sidebar)' }}>
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--nav-item-hover-bg)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }}
          >
            <Keyboard size={14} />
            <span>{t('nav.shortcuts')}</span>
            <kbd className="ml-auto text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>?</kbd>
          </button>
        )}
        <button
          onClick={() => navigate({ name: 'settings' })}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors hover:text-red-400 hover:bg-red-500/5"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={14} />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg transition-colors"
        style={{
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-sidebar)',
          color: 'var(--gold)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-60
          transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'var(--bg-sidebar)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border-sidebar)',
        }}
      >
        {sidebar}
      </aside>
    </>
  );
}
