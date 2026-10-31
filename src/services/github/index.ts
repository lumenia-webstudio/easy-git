import { GitHubClient } from './client';
import { createUsersAPI } from './users';
import { createReposAPI } from './repos';
import { createBranchesAPI } from './branches';
import { createIssuesAPI } from './issues';
import { createPullsAPI } from './pulls';
import { createReleasesAPI } from './releases';
import { createNotificationsAPI } from './notifications';
import { createWorkflowsAPI } from './workflows';

export { GitHubAPIError } from './client';

export function createGitHubAPI(token: string) {
  const client = new GitHubClient(token);

  return {
    users: createUsersAPI(client),
    repos: createReposAPI(client),
    branches: createBranchesAPI(client),
    issues: createIssuesAPI(client),
    pulls: createPullsAPI(client),
    releases: createReleasesAPI(client),
    notifications: createNotificationsAPI(client),
    workflows: createWorkflowsAPI(client),
  };
}

export type GitHubAPI = ReturnType<typeof createGitHubAPI>;
