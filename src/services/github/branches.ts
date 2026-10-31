import { GitHubClient } from './client';
import type { GitHubBranch } from '../../types';

export function createBranchesAPI(client: GitHubClient) {
  return {
    async listBranches(owner: string, repo: string, page = 1): Promise<GitHubBranch[]> {
      return client.get<GitHubBranch[]>(`/repos/${owner}/${repo}/branches`, {
        per_page: 100,
        page,
      });
    },

    async getBranch(owner: string, repo: string, branch: string): Promise<GitHubBranch> {
      return client.get<GitHubBranch>(`/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`);
    },

    async createBranch(
      owner: string,
      repo: string,
      branchName: string,
      fromSha: string,
    ): Promise<{ ref: string; object: { sha: string } }> {
      return client.post(`/repos/${owner}/${repo}/git/refs`, {
        ref: `refs/heads/${branchName}`,
        sha: fromSha,
      });
    },

    async deleteBranch(owner: string, repo: string, branch: string): Promise<void> {
      return client.delete<void>(
        `/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`,
      );
    },

    async compareBranches(
      owner: string,
      repo: string,
      base: string,
      head: string,
    ): Promise<{
      ahead_by: number;
      behind_by: number;
      status: string;
      total_commits: number;
      files: Array<{ filename: string; status: string }>;
    }> {
      return client.get(
        `/repos/${owner}/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`,
      );
    },

    async getProtectedBranch(owner: string, repo: string, branch: string): Promise<unknown> {
      return client.get(`/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection`);
    },

    async getBranchRef(owner: string, repo: string, branch: string): Promise<{ object: { sha: string } }> {
      return client.get(
        `/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`,
      );
    },
  };
}
