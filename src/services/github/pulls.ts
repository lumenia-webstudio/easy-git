import { GitHubClient } from './client';
import type { GitHubPullRequest, GitHubComment } from '../../types';

export function createPullsAPI(client: GitHubClient) {
  return {
    async listPulls(
      owner: string,
      repo: string,
      params?: {
        state?: 'open' | 'closed' | 'all';
        head?: string;
        base?: string;
        sort?: 'created' | 'updated' | 'popularity' | 'long-running';
        direction?: 'asc' | 'desc';
        page?: number;
      },
    ): Promise<GitHubPullRequest[]> {
      return client.get<GitHubPullRequest[]>(`/repos/${owner}/${repo}/pulls`, {
        per_page: 30,
        state: 'open',
        ...params,
      });
    },

    async getPull(owner: string, repo: string, number: number): Promise<GitHubPullRequest> {
      return client.get<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls/${number}`);
    },

    async createPull(
      owner: string,
      repo: string,
      data: {
        title: string;
        body?: string;
        head: string;
        base: string;
        draft?: boolean;
        maintainer_can_modify?: boolean;
      },
    ): Promise<GitHubPullRequest> {
      return client.post<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls`, data);
    },

    async updatePull(
      owner: string,
      repo: string,
      number: number,
      data: Partial<{
        title: string;
        body: string;
        state: 'open' | 'closed';
        base: string;
        maintainer_can_modify: boolean;
      }>,
    ): Promise<GitHubPullRequest> {
      return client.patch<GitHubPullRequest>(`/repos/${owner}/${repo}/pulls/${number}`, data);
    },

    async mergePull(
      owner: string,
      repo: string,
      number: number,
      method: 'merge' | 'squash' | 'rebase' = 'merge',
      commitTitle?: string,
      commitMessage?: string,
    ): Promise<{ sha: string; merged: boolean; message: string }> {
      return client.put(`/repos/${owner}/${repo}/pulls/${number}/merge`, {
        merge_method: method,
        commit_title: commitTitle,
        commit_message: commitMessage,
      });
    },

    async listReviews(
      owner: string,
      repo: string,
      number: number,
    ): Promise<Array<{
      id: number;
      user: { login: string; avatar_url: string };
      state: string;
      body: string;
      submitted_at: string;
    }>> {
      return client.get(`/repos/${owner}/${repo}/pulls/${number}/reviews`);
    },

    async createReview(
      owner: string,
      repo: string,
      number: number,
      data: {
        event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
        body?: string;
      },
    ): Promise<unknown> {
      return client.post(`/repos/${owner}/${repo}/pulls/${number}/reviews`, data);
    },

    async listComments(owner: string, repo: string, number: number): Promise<GitHubComment[]> {
      return client.get<GitHubComment[]>(`/repos/${owner}/${repo}/issues/${number}/comments`, {
        per_page: 100,
      });
    },

    async createComment(
      owner: string,
      repo: string,
      number: number,
      body: string,
    ): Promise<GitHubComment> {
      return client.post<GitHubComment>(`/repos/${owner}/${repo}/issues/${number}/comments`, {
        body,
      });
    },

    async requestReviewers(
      owner: string,
      repo: string,
      number: number,
      reviewers: string[],
    ): Promise<GitHubPullRequest> {
      return client.post(`/repos/${owner}/${repo}/pulls/${number}/requested_reviewers`, {
        reviewers,
      });
    },

    async getFiles(
      owner: string,
      repo: string,
      number: number,
    ): Promise<Array<{
      filename: string;
      status: string;
      additions: number;
      deletions: number;
      changes: number;
      patch?: string;
    }>> {
      return client.get(`/repos/${owner}/${repo}/pulls/${number}/files`, { per_page: 100 });
    },

    async checkMerged(owner: string, repo: string, number: number): Promise<boolean> {
      try {
        await client.request(`/repos/${owner}/${repo}/pulls/${number}/merge`, {}, false);
        return true;
      } catch {
        return false;
      }
    },
  };
}
