import apiClient from './client';
import type { User, FriendRequest, Friend } from '@/types/user';

export const friendApi = {
  // Search users to add as friends
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get(`/users.list?query={"$or":[{"username":{"$regex":"${query}","$options":"i"}},{"name":{"$regex":"${query}","$options":"i"}}]}`);
    return response.data.users;
  },

  // Send friend request
  sendFriendRequest: async (userId: string, message: string): Promise<FriendRequest> => {
    // Rocket.Chat doesn't have native friend request API, so we use DM + custom message
    // First create a DM room
    const dmResponse = await apiClient.post('/im.create', { username: userId });
    const roomId = dmResponse.data.room._id;
    
    // Send the friend request message
    await apiClient.post('/chat.sendMessage', {
      message: {
        rid: roomId,
        msg: `[FRIEND_REQUEST] ${message}`,
      },
    });
    
    return {
      _id: `fr_${Date.now()}`,
      from: { _id: localStorage.getItem('userId') || '', username: '' } as User,
      to: { _id: userId } as User,
      message,
      status: 'pending',
      createdAt: new Date(),
    };
  },

  // Get friend requests (simulated using DM messages)
  getFriendRequests: async (): Promise<FriendRequest[]> => {
    // In a real implementation, this would query a custom collection
    // For now, we'll return an empty array and implement the actual logic later
    return [];
  },

  // Accept friend request
  acceptFriendRequest: async (requestId: string): Promise<void> => {
    // Implementation depends on backend storage
    console.log('Accepting friend request:', requestId);
  },

  // Reject friend request
  rejectFriendRequest: async (requestId: string): Promise<void> => {
    // Implementation depends on backend storage
    console.log('Rejecting friend request:', requestId);
  },

  // Get friends list
  getFriends: async (): Promise<Friend[]> => {
    // Rocket.Chat doesn't have native friends API
    // We'll use DM rooms as a proxy for friends
    const response = await apiClient.get('/im.list');
    const dms = response.data.ims || [];
    
    return dms.map((dm: any) => ({
      _id: dm._id,
      user: {
        _id: dm._id,
        username: dm.usernames?.find((u: string) => u !== localStorage.getItem('username')) || '',
      } as User,
      addedAt: new Date(dm.ts),
      isBlocked: false,
    }));
  },

  // Remove friend (delete DM subscription)
  removeFriend: async (friendId: string): Promise<void> => {
    await apiClient.post('/subscriptions.removeRoom', { roomId: friendId });
  },

  // Block user
  blockUser: async (userId: string): Promise<void> => {
    await apiClient.post('/users.block', { userId });
  },

  // Unblock user
  unblockUser: async (userId: string): Promise<void> => {
    await apiClient.post('/users.unblock', { userId });
  },
};