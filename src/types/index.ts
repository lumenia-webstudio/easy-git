export interface Account {
  id: string;
  username: string;
  token: string;
  avatarUrl: string;
  name: string | null;
  addedAt: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  hireable: boolean | null;
  twitter_username: string | null;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  private: boolean;
  fork: boolean;
  html_url: string;
  clone_url: string;
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  open_issues_count: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
  disabled: boolean;
  size: number;
  topics: string[];
  visibility: 'public' | 'private' | 'internal';
  license: { name: string; spdx_id: string } | null;
}

export interface GitHubContent {
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  download_url: string | null;
  encoding?: string;
  content?: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: { name: string; email: string; date: string };
    committer: { name: string; email: string; date: string };
    message: string;
  };
  author: { login: string; avatar_url: string } | null;
  committer: { login: string; avatar_url: string } | null;
  stats?: { additions: number; deletions: number; total: number };
  files?: Array<{ filename: string; status: string; additions: number; deletions: number; patch?: string }>;
}

export interface GitHubBranch {
  name: string;
  commit: { sha: string; url: string };
  protected: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  user: { login: string; avatar_url: string };
  assignees: Array<{ login: string; avatar_url: string }>;
  labels: Array<{ id: number; name: string; color: string; description: string | null }>;
  milestone: GitHubMilestone | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  pull_request?: { url: string };
  locked: boolean;
}

export interface GitHubComment {
  id: number;
  user: { login: string; avatar_url: string };
  body: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
  default: boolean;
}

export interface GitHubMilestone {
  id: number;
  number: number;
  title: string;
  description: string | null;
  state: 'open' | 'closed';
  open_issues: number;
  closed_issues: number;
  due_on: string | null;
  created_at: string;
  updated_at: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  merged: boolean;
  merged_at: string | null;
  draft: boolean;
  user: { login: string; avatar_url: string };
  assignees: Array<{ login: string; avatar_url: string }>;
  requested_reviewers: Array<{ login: string; avatar_url: string }>;
  labels: Array<{ id: number; name: string; color: string }>;
  milestone: GitHubMilestone | null;
  head: { ref: string; sha: string; repo: GitHubRepo | null };
  base: { ref: string; sha: string; repo: GitHubRepo };
  mergeable: boolean | null;
  rebaseable: boolean | null;
  mergeable_state: string;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string | null;
  author: { login: string; avatar_url: string };
  assets: Array<{
    id: number;
    name: string;
    size: number;
    download_count: number;
    browser_download_url: string;
    content_type: string;
    created_at: string;
  }>;
  html_url: string;
  zipball_url: string;
  tarball_url: string;
}

export interface GitHubNotification {
  id: string;
  unread: boolean;
  reason: string;
  subject: { title: string; url: string; type: string; latest_comment_url: string | null };
  repository: { full_name: string; private: boolean; owner: { login: string; avatar_url: string } };
  updated_at: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: { login: string; avatar_url: string };
  repo: { name: string };
  payload: Record<string, unknown>;
  created_at: string;
}

export type Language = 'fr' | 'en';
export type Theme = 'dark' | 'light';

export type Page =
  | { name: 'dashboard' }
  | { name: 'repositories' }
  | { name: 'repository'; owner: string; repo: string; tab: RepoTab; path?: string }
  | { name: 'issue'; owner: string; repo: string; number: number }
  | { name: 'pull'; owner: string; repo: string; number: number }
  | { name: 'profile' }
  | { name: 'settings' }
  | { name: 'notifications' }
  | { name: 'starred' }
  | { name: 'gitref' }
  | { name: 'terminal' }
  | { name: 'help'; section?: string };

export type RepoTab = 'files' | 'commits' | 'branches' | 'issues' | 'pulls' | 'releases' | 'actions' | 'repoSettings';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'warning' | 'danger' | 'info';
  requireTyping?: string;
}

export interface CreateRepoInput {
  name: string;
  description?: string;
  private: boolean;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
}

export interface GitHubError {
  status: number;
  message: string;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: 'queued' | 'in_progress' | 'completed' | 'waiting' | 'requested' | 'pending';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
  workflow_id: number;
  run_number: number;
  event: string;
  created_at: string;
  updated_at: string;
  html_url: string;
  actor: { login: string; avatar_url: string };
  triggering_actor: { login: string; avatar_url: string } | null;
  run_attempt: number;
  display_title: string;
}

export interface GitHubWorkflow {
  id: number;
  name: string;
  path: string;
  state: 'active' | 'disabled_manually' | 'disabled_inactivity';
  created_at: string;
  updated_at: string;
  html_url: string;
}
