import { GitHubClient } from './client';
import type { GitHubRelease } from '../../types';

export function createReleasesAPI(client: GitHubClient) {
  return {
    async listReleases(owner: string, repo: string, page = 1): Promise<GitHubRelease[]> {
      return client.get<GitHubRelease[]>(`/repos/${owner}/${repo}/releases`, {
        per_page: 30,
        page,
      });
    },

    async getRelease(owner: string, repo: string, id: number): Promise<GitHubRelease> {
      return client.get<GitHubRelease>(`/repos/${owner}/${repo}/releases/${id}`);
    },

    async getLatestRelease(owner: string, repo: string): Promise<GitHubRelease> {
      return client.get<GitHubRelease>(`/repos/${owner}/${repo}/releases/latest`);
    },

    async getReleaseByTag(owner: string, repo: string, tag: string): Promise<GitHubRelease> {
      return client.get<GitHubRelease>(
        `/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
      );
    },

    async createRelease(
      owner: string,
      repo: string,
      data: {
        tag_name: string;
        target_commitish?: string;
        name?: string;
        body?: string;
        draft?: boolean;
        prerelease?: boolean;
        generate_release_notes?: boolean;
      },
    ): Promise<GitHubRelease> {
      return client.post<GitHubRelease>(`/repos/${owner}/${repo}/releases`, data);
    },

    async updateRelease(
      owner: string,
      repo: string,
      id: number,
      data: Partial<{
        tag_name: string;
        target_commitish: string;
        name: string;
        body: string;
        draft: boolean;
        prerelease: boolean;
      }>,
    ): Promise<GitHubRelease> {
      return client.patch<GitHubRelease>(`/repos/${owner}/${repo}/releases/${id}`, data);
    },

    async deleteRelease(owner: string, repo: string, id: number): Promise<void> {
      return client.delete<void>(`/repos/${owner}/${repo}/releases/${id}`);
    },

    async deleteTag(owner: string, repo: string, tag: string): Promise<void> {
      return client.delete<void>(
        `/repos/${owner}/${repo}/git/refs/tags/${encodeURIComponent(tag)}`,
      );
    },
  };
}
