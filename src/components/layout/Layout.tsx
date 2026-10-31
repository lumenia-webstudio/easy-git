import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { ConfirmModal } from '../ui/ConfirmModal';
import { KeyboardShortcuts } from '../ui/KeyboardShortcuts';
import { useApp } from '../../context/AppContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { navigate, currentPage } = useApp();

  useEffect(() => {
    let buffer = '';
    let timer: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: KeyboardEvent) => {
      // Ctrl+` : toggle terminal (fonctionne même depuis un input)
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        navigate(currentPage.name === 'terminal'
          ? { name: 'dashboard' }
          : { name: 'terminal' });
        return;
      }

      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === '?') {
        setShortcutsOpen(true);
        return;
      }

      buffer += e.key.toLowerCase();
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { buffer = ''; }, 1000);

      if (buffer === 'gd') { navigate({ name: 'dashboard' }); buffer = ''; }
      else if (buffer === 'gr') { navigate({ name: 'repositories' }); buffer = ''; }
      else if (buffer === 'gn') { navigate({ name: 'notifications' }); buffer = ''; }
      else if (buffer === 'gu') { navigate({ name: 'profile' }); buffer = ''; }
      else if (buffer === 'gs') { navigate({ name: 'settings' }); buffer = ''; }
      else if (buffer === 'gp') { navigate({ name: 'terminal' }); buffer = ''; }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (timer) clearTimeout(timer);
    };
  }, [navigate, currentPage]);

  return (
    <div className="min-h-screen relative" style={{ color: 'var(--text-primary)' }}>
      <div className="app-bg fixed inset-0 z-0" />

      <div className="relative z-10">
        <Sidebar onOpenShortcuts={() => setShortcutsOpen(true)} />
        <div className="lg:ml-60 flex flex-col min-h-screen">
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </div>

      <ToastContainer />
      <ConfirmModal />
      <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
