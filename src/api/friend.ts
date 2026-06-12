import apiClient from './client';
import type { User, Friend } from '@/types/user';

export const friendApi = {
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get(`/users.list?query={"$or":[{"username":{"$regex":"${query}","$options":"i"}},{"name":{"$regex":"${query}","$options":"i"}}]}`);
    return response.data.users;
  },

  sendFriendRequest: async (username: string, message: string): Promise<void> => {
    const dmResponse = await apiClient.post('/im.create', { username });
    const roomId = dmResponse.data.room._id;
    await apiClient.post('/chat.sendMessage', {
      message: {
        rid: roomId,
        msg: `[FRIEND_REQUEST]${message}`,
      },
    });
  },

  acceptFriendRequest: async (username: string): Promise<void> => {
    const dmResponse = await apiClient.post('/im.create', { username });
    const roomId = dmResponse.data.room._id;
    await apiClient.post('/chat.sendMessage', {
      message: {
        rid: roomId,
        msg: '[FRIEND_ACCEPT]我同意了你的好友请求',
      },
    });
  },

  getFriends: async (): Promise<Friend[]> => {
    const response = await apiClient.get('/im.list');
    const dms = response.data.ims || [];
    const currentUsername = localStorage.getItem('username');
    
    const friends: Friend[] = [];
    for (const dm of dms) {
      const otherUsername = dm.usernames?.find((u: string) => u !== currentUsername);
      if (otherUsername) {
        friends.push({
          _id: dm._id,
          user: {
            _id: dm._id,
            username: otherUsername,
          } as User,
          addedAt: new Date(dm.ts),
          isBlocked: false,
        });
      }
    }
    return friends;
  },

  removeFriend: async (roomId: string): Promise<void> => {
    await apiClient.post('/subscriptions.removeRoom', { roomId });
  },

  blockUser: async (userId: string): Promise<void> => {
    await apiClient.post('/users.block', { userId });
  },

  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.post('/users.unblock', { userId });
  },
};
