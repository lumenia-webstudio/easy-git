import { lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';

const RepositoriesPage = lazy(() => import('./pages/repositories/RepositoriesPage').then(m => ({ default: m.RepositoriesPage })));
const RepositoryPage   = lazy(() => import('./pages/repositories/RepositoryPage').then(m => ({ default: m.RepositoryPage })));
const ProfilePage      = lazy(() => import('./pages/profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage     = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const StarredPage      = lazy(() => import('./pages/starred/StarredPage').then(m => ({ default: m.StarredPage })));
const GitReferencePage = lazy(() => import('./pages/gitref/GitReferencePage').then(m => ({ default: m.GitReferencePage })));
const TerminalPage     = lazy(() => import('./pages/terminal/TerminalPage').then(m => ({ default: m.TerminalPage })));
const HelpPage         = lazy(() => import('./pages/help/HelpPage').then(m => ({ default: m.HelpPage })));

function AppRouter() {
  const { activeAccount, currentPage } = useApp();

  if (!activeAccount) {
    return <LoginPage />;
  }

  if (currentPage.name === 'repository') {
    return (
      <Layout>
        <Suspense fallback={null}>
          <RepositoryPage
            owner={currentPage.owner}
            repo={currentPage.repo}
            tab={currentPage.tab}
          />
        </Suspense>
      </Layout>
    );
  }

  return (
    <Layout>
      <Suspense fallback={null}>
        {currentPage.name === 'dashboard' && <DashboardPage />}
        {currentPage.name === 'repositories' && <RepositoriesPage />}
        {currentPage.name === 'profile' && <ProfilePage />}
        {currentPage.name === 'settings' && <SettingsPage />}
        {currentPage.name === 'notifications' && <NotificationsPage />}
        {currentPage.name === 'starred' && <StarredPage />}
        {currentPage.name === 'gitref' && <GitReferencePage />}
        {currentPage.name === 'terminal' && <TerminalPage />}
        {currentPage.name === 'help' && <HelpPage section={(currentPage as { name: 'help'; section?: string }).section} />}
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
