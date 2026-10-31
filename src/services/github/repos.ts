import { GitHubClient } from './client';
import type { GitHubRepo, GitHubContent, GitHubCommit, CreateRepoInput } from '../../types';

export function createReposAPI(client: GitHubClient) {
  return {
    async listRepos(page = 1, sort: 'updated' | 'pushed' | 'full_name' | 'created' = 'updated'): Promise<GitHubRepo[]> {
      return client.get<GitHubRepo[]>('/user/repos', {
        per_page: 50,
        page,
        sort,
        affiliation: 'owner,collaborator',
      });
    },

    async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
      return client.get<GitHubRepo>(`/repos/${owner}/${repo}`);
    },

    async createRepo(data: CreateRepoInput): Promise<GitHubRepo> {
      return client.post<GitHubRepo>('/user/repos', data);
    },

    async deleteRepo(owner: string, repo: string): Promise<void> {
      return client.delete<void>(`/repos/${owner}/${repo}`);
    },

    async updateRepo(owner: string, repo: string, data: Partial<{
      name: string;
      description: string;
      private: boolean;
      archived: boolean;
      default_branch: string;
      has_issues: boolean;
      has_projects: boolean;
      has_wiki: boolean;
    }>): Promise<GitHubRepo> {
      return client.patch<GitHubRepo>(`/repos/${owner}/${repo}`, data);
    },

    async forkRepo(owner: string, repo: string, org?: string): Promise<GitHubRepo> {
      return client.post<GitHubRepo>(`/repos/${owner}/${repo}/forks`, org ? { organization: org } : {});
    },

    async getContents(owner: string, repo: string, path: string, ref?: string): Promise<GitHubContent | GitHubContent[]> {
      const params: Record<string, string> = {};
      if (ref) params.ref = ref;
      return client.get<GitHubContent | GitHubContent[]>(`/repos/${owner}/${repo}/contents/${path}`, params);
    },

    async createOrUpdateFile(
      owner: string,
      repo: string,
      path: string,
      content: string,
      message: string,
      sha?: string,
      branch?: string,
    ): Promise<{ content: GitHubContent }> {
      const body: Record<string, string> = {
        message,
        content: btoa(unescape(encodeURIComponent(content))),
      };
      if (sha) body.sha = sha;
      if (branch) body.branch = branch;
      return client.put<{ content: GitHubContent }>(`/repos/${owner}/${repo}/contents/${path}`, body);
    },

    async deleteFile(
      owner: string,
      repo: string,
      path: string,
      message: string,
      sha: string,
      branch?: string,
    ): Promise<void> {
      const body: Record<string, string> = { message, sha };
      if (branch) body.branch = branch;
      return client.delete<void>(`/repos/${owner}/${repo}/contents/${path}`, body);
    },

    async listCommits(owner: string, repo: string, params?: {
      sha?: string;
      path?: string;
      page?: number;
      per_page?: number;
    }): Promise<GitHubCommit[]> {
      return client.get<GitHubCommit[]>(`/repos/${owner}/${repo}/commits`, {
        per_page: 30,
        ...params,
      });
    },

    async getCommit(owner: string, repo: string, ref: string): Promise<GitHubCommit> {
      return client.get<GitHubCommit>(`/repos/${owner}/${repo}/commits/${ref}`);
    },

    async getTree(owner: string, repo: string, treeSha: string): Promise<{
      tree: Array<{ path: string; type: string; sha: string; size?: number }>;
    }> {
      return client.get(`/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`);
    },

    async getReadme(owner: string, repo: string, ref?: string): Promise<GitHubContent> {
      const params: Record<string, string> = {};
      if (ref) params.ref = ref;
      return client.get<GitHubContent>(`/repos/${owner}/${repo}/readme`, params);
    },

    async getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
      return client.get<Record<string, number>>(`/repos/${owner}/${repo}/languages`);
    },

    async getContributors(owner: string, repo: string): Promise<Array<{
      login: string; avatar_url: string; contributions: number;
    }>> {
      return client.get(`/repos/${owner}/${repo}/contributors`, { per_page: 20 });
    },

    async getTopics(owner: string, repo: string): Promise<{ names: string[] }> {
      return client.get(`/repos/${owner}/${repo}/topics`);
    },

    async starRepo(owner: string, repo: string): Promise<void> {
      return client.put(`/user/starred/${owner}/${repo}`);
    },

    async unstarRepo(owner: string, repo: string): Promise<void> {
      return client.delete(`/user/starred/${owner}/${repo}`);
    },

    async isStarred(owner: string, repo: string): Promise<boolean> {
      try {
        await client.request(`/user/starred/${owner}/${repo}`, {}, false);
        return true;
      } catch {
        return false;
      }
    },

    async listStarred(page = 1, per_page = 30): Promise<GitHubRepo[]> {
      return client.get<GitHubRepo[]>('/user/starred', {
        per_page,
        page,
        sort: 'updated',
        direction: 'desc',
      });
    },
  };
}
