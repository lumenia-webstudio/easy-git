import { GitHubClient } from './client';
import type { GitHubIssue, GitHubComment, GitHubLabel, GitHubMilestone } from '../../types';

export function createIssuesAPI(client: GitHubClient) {
  return {
    async listIssues(
      owner: string,
      repo: string,
      params?: {
        state?: 'open' | 'closed' | 'all';
        labels?: string;
        assignee?: string;
        milestone?: string | number;
        page?: number;
        per_page?: number;
        sort?: 'created' | 'updated' | 'comments';
        direction?: 'asc' | 'desc';
      },
    ): Promise<GitHubIssue[]> {
      const issues = await client.get<GitHubIssue[]>(`/repos/${owner}/${repo}/issues`, {
        per_page: 30,
        state: 'open',
        ...params,
      });
      return issues.filter((i) => !i.pull_request);
    },

    async getIssue(owner: string, repo: string, number: number): Promise<GitHubIssue> {
      return client.get<GitHubIssue>(`/repos/${owner}/${repo}/issues/${number}`);
    },

    async createIssue(
      owner: string,
      repo: string,
      data: {
        title: string;
        body?: string;
        labels?: string[];
        assignees?: string[];
        milestone?: number;
      },
    ): Promise<GitHubIssue> {
      return client.post<GitHubIssue>(`/repos/${owner}/${repo}/issues`, data);
    },

    async updateIssue(
      owner: string,
      repo: string,
      number: number,
      data: Partial<{
        title: string;
        body: string;
        state: 'open' | 'closed';
        labels: string[];
        assignees: string[];
        milestone: number | null;
      }>,
    ): Promise<GitHubIssue> {
      return client.patch<GitHubIssue>(`/repos/${owner}/${repo}/issues/${number}`, data);
    },

    async lockIssue(owner: string, repo: string, number: number): Promise<void> {
      return client.put<void>(`/repos/${owner}/${repo}/issues/${number}/lock`, {
        lock_reason: 'resolved',
      });
    },

    async unlockIssue(owner: string, repo: string, number: number): Promise<void> {
      return client.delete<void>(`/repos/${owner}/${repo}/issues/${number}/lock`);
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

    async deleteComment(owner: string, repo: string, commentId: number): Promise<void> {
      return client.delete<void>(`/repos/${owner}/${repo}/issues/comments/${commentId}`);
    },

    async listLabels(owner: string, repo: string): Promise<GitHubLabel[]> {
      return client.get<GitHubLabel[]>(`/repos/${owner}/${repo}/labels`, { per_page: 100 });
    },

    async createLabel(
      owner: string,
      repo: string,
      data: { name: string; color: string; description?: string },
    ): Promise<GitHubLabel> {
      return client.post<GitHubLabel>(`/repos/${owner}/${repo}/labels`, data);
    },

    async deleteLabel(owner: string, repo: string, name: string): Promise<void> {
      return client.delete<void>(`/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`);
    },

    async listMilestones(owner: string, repo: string): Promise<GitHubMilestone[]> {
      return client.get<GitHubMilestone[]>(`/repos/${owner}/${repo}/milestones`, {
        per_page: 100,
        state: 'open',
      });
    },

    async createMilestone(
      owner: string,
      repo: string,
      data: { title: string; description?: string; due_on?: string },
    ): Promise<GitHubMilestone> {
      return client.post<GitHubMilestone>(`/repos/${owner}/${repo}/milestones`, data);
    },
  };
}
