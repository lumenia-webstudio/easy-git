import { GitHubClient } from './client';
import type { GitHubWorkflow, GitHubWorkflowRun } from '../../types';

export function createWorkflowsAPI(client: GitHubClient) {
  return {
    async listWorkflows(owner: string, repo: string): Promise<GitHubWorkflow[]> {
      const res = await client.get<{ workflows: GitHubWorkflow[] }>(`/repos/${owner}/${repo}/actions/workflows`);
      return res.workflows ?? [];
    },

    async listRuns(owner: string, repo: string, params?: {
      workflow_id?: number;
      branch?: string;
      status?: string;
      page?: number;
      per_page?: number;
    }): Promise<{ total_count: number; workflow_runs: GitHubWorkflowRun[] }> {
      return client.get(`/repos/${owner}/${repo}/actions/runs`, {
        per_page: 25,
        ...params,
      });
    },

    async reRunWorkflow(owner: string, repo: string, runId: number): Promise<void> {
      return client.post<void>(`/repos/${owner}/${repo}/actions/runs/${runId}/rerun`);
    },

    async reRunFailedJobs(owner: string, repo: string, runId: number): Promise<void> {
      return client.post<void>(`/repos/${owner}/${repo}/actions/runs/${runId}/rerun-failed-jobs`);
    },

    async cancelRun(owner: string, repo: string, runId: number): Promise<void> {
      return client.post<void>(`/repos/${owner}/${repo}/actions/runs/${runId}/cancel`);
    },
  };
}
