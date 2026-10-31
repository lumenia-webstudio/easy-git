import React, { useEffect, useState } from 'react';
import {
  FolderGit2, Star, GitFork, AlertCircle, GitBranch,
  GitCommitVertical as GitCommit, GitPullRequest, Tag,
  ExternalLink, Settings, Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Skeleton } from '../../components/ui/Skeleton';
import { FileExplorer } from './FileExplorer';
import { CommitHistory } from './CommitHistory';
import { RepoSettingsTab } from './RepoSettingsTab';
import { BranchesTab } from '../branches/BranchesTab';
import { IssuesPage } from '../issues/IssuesPage';
import { PullRequestsPage } from '../pullrequests/PullRequestsPage';
import { ReleasesPage } from '../releases/ReleasesPage';
import { WorkflowsTab } from '../actions/WorkflowsTab';
import type { GitHubRepo, RepoTab } from '../../types';

export function RepositoryPage({ owner, repo: repoName, tab }: { owner: string; repo: string; tab: RepoTab }) {
  const { api, t, navigate, showToast } = useApp();
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [starring, setStarring] = useState(false);

  const load = async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const [r, starred] = await Promise.all([
        api.repos.getRepo(owner, repoName),
        api.repos.isStarred(owner, repoName),
      ]);
      setRepo(r);
      setIsStarred(starred);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [owner, repoName]);

  const setCurrentTab = (tabKey: RepoTab) => navigate({ name: 'repository', owner, repo: repoName, tab: tabKey });

  const handleStar = async () => {
    if (!repo) return;
    setStarring(true);
    try {
      if (isStarred) {
        await api!.repos.unstarRepo(owner, repoName);
      } else {
        await api!.repos.starRepo(owner, repoName);
      }
      setIsStarred(!isStarred);
      setRepo((r) => r ? { ...r, stargazers_count: r.stargazers_count + (isStarred ? -1 : 1) } : r);
    } catch {
      showToast('error', t('common.error'));
    } finally {
      setStarring(false);
    }
  };

  const tabs: Array<{ key: RepoTab; label: string; icon: React.ReactNode; count?: number }> = [
    { key: 'files', label: t('files.title'), icon: <FolderGit2 size={14} /> },
    { key: 'commits', label: t('commits.title'), icon: <GitCommit size={14} /> },
    { key: 'branches', label: t('branches.titleSimple'), icon: <GitBranch size={14} /> },
    { key: 'issues', label: t('issues.title'), icon: <AlertCircle size={14} />, count: repo?.open_issues_count },
    { key: 'pulls', label: t('pulls.title'), icon: <GitPullRequest size={14} /> },
    { key: 'releases', label: t('releases.title'), icon: <Tag size={14} /> },
    { key: 'actions', label: t('actions.title'), icon: <Zap size={14} /> },
    { key: 'repoSettings', label: t('repoSettings.title'), icon: <Settings size={14} /> },
  ];

  if (error) return (
    <div className="flex flex-col">
      <Header
        breadcrumbs={[{ label: t('repos.title'), page: { name: 'repositories' } }, { label: repoName }]}
        title={repoName}
      />
      <div className="p-6"><ErrorMessage error={error} onRetry={load} /></div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <Header
        breadcrumbs={[
          { label: t('repos.title'), page: { name: 'repositories' } },
          { label: owner },
          { label: repoName },
        ]}
        title={repoName}
        subtitle={owner}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<Star size={14} className={isStarred ? 'text-yellow-400 fill-yellow-400' : ''} />}
              loading={starring}
              onClick={handleStar}
            >
              {repo?.stargazers_count ?? 0}
            </Button>
          </div>
        }
      />

      <div className="px-6 pt-4">
        {loading ? (
          <div className="space-y-3 mb-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
        ) : repo && (
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {repo.private ? (
                <Badge variant="default">{t('common.private')}</Badge>
              ) : (
                <Badge variant="info">{t('common.public')}</Badge>
              )}
              {repo.archived && <Badge variant="warning">{t('common.archived')}</Badge>}
              {repo.fork && <Badge variant="default">{t('repos.forkOf') + ' ...'}</Badge>}
              {repo.language && <Badge variant="default">{repo.language}</Badge>}
            </div>
            {repo.description && (
              <p className="text-sm text-slate-400 mb-3">{repo.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Star size={12} /> {repo.stargazers_count} {t('repos.stars')}</span>
              <span className="flex items-center gap-1"><GitFork size={12} /> {repo.forks_count} {t('repos.forks')}</span>
              <span className="flex items-center gap-1"><AlertCircle size={12} /> {repo.open_issues_count} {t('repos.issues')}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 overflow-x-auto pb-0">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setCurrentTab(tabItem.key)}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-colors
                ${tab === tabItem.key
                  ? 'text-sky-400 border-sky-400 bg-sky-500/10'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:border-slate-600'}
              `}
            >
              {tabItem.icon}
              {tabItem.label}
              {tabItem.count !== undefined && tabItem.count > 0 && (
                <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-full text-xs">
                  {tabItem.count}
                </span>
              )}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 pb-1">
            <a
              href={repo?.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-600 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              title={t('profile.viewOnGitHub')}
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <div className="border-b border-slate-800" />
      </div>

      <div className="flex-1 p-6">
        {tab === 'files' && <FileExplorer owner={owner} repo={repoName} defaultBranch={repo?.default_branch} />}
        {tab === 'commits' && <CommitHistory owner={owner} repo={repoName} defaultBranch={repo?.default_branch} />}
        {tab === 'branches' && <BranchesTab owner={owner} repo={repoName} defaultBranch={repo?.default_branch ?? 'main'} onDefaultBranchChange={(b) => setRepo((r) => r ? { ...r, default_branch: b } : r)} />}
        {tab === 'issues' && <IssuesPage owner={owner} repo={repoName} />}
        {tab === 'pulls' && <PullRequestsPage owner={owner} repo={repoName} />}
        {tab === 'releases' && <ReleasesPage owner={owner} repo={repoName} />}
        {tab === 'actions' && <WorkflowsTab owner={owner} repo={repoName} />}
        {tab === 'repoSettings' && repo && (
          <RepoSettingsTab
            owner={owner}
            repo={repoName}
            repoData={repo}
            onRepoUpdated={(updated) => setRepo(updated)}
          />
        )}
      </div>
    </div>
  );
}
