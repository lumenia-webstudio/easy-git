import { GitHubClient } from './client';
import type { GitHubNotification } from '../../types';

export function createNotificationsAPI(client: GitHubClient) {
  return {
    async list(params?: { all?: boolean; participating?: boolean; page?: number; per_page?: number }): Promise<GitHubNotification[]> {
      return client.get<GitHubNotification[]>('/notifications', {
        per_page: 50,
        ...params,
      });
    },

    async markAllRead(): Promise<void> {
      return client.put<void>('/notifications');
    },

    async markRead(threadId: string): Promise<void> {
      return client.patch<void>(`/notifications/threads/${threadId}`);
    },

    async getUnreadCount(): Promise<number> {
      const notifications = await client.get<GitHubNotification[]>('/notifications', { per_page: 50 });
      return notifications.filter((n) => n.unread).length;
    },
  };
}
