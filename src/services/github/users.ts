import { GitHubClient } from './client';
import type { GitHubUser, GitHubEvent, GitHubNotification } from '../../types';

export function createUsersAPI(client: GitHubClient) {
  return {
    async getAuthenticatedUser(): Promise<GitHubUser> {
      return client.get<GitHubUser>('/user');
    },

    async updateAuthenticatedUser(data: Partial<{
      name: string;
      email: string;
      blog: string;
      company: string;
      location: string;
      hireable: boolean;
      bio: string;
      twitter_username: string;
    }>): Promise<GitHubUser> {
      return client.patch<GitHubUser>('/user', data);
    },

    async getUser(username: string): Promise<GitHubUser> {
      return client.get<GitHubUser>(`/users/${username}`);
    },

    async getUserEvents(username: string, page = 1): Promise<GitHubEvent[]> {
      return client.get<GitHubEvent[]>(`/users/${username}/events`, { per_page: 30, page });
    },

    async getNotifications(all = false): Promise<GitHubNotification[]> {
      return client.get<GitHubNotification[]>('/notifications', { all, per_page: 50 });
    },

    async markNotificationRead(threadId: string): Promise<void> {
      return client.patch<void>(`/notifications/threads/${threadId}`);
    },

    async markAllNotificationsRead(): Promise<void> {
      return client.put<void>('/notifications', { read: true });
    },

    async getStarredRepos(page = 1) {
      return client.get<{ full_name: string; stargazers_count: number }[]>('/user/starred', {
        per_page: 30,
        page,
      });
    },

    async getAssignedIssues() {
      return client.get<unknown[]>('/issues', { filter: 'assigned', state: 'open', per_page: 20 });
    },
  };
}
