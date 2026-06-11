import { create } from 'zustand';
import { friendApi } from '@/api/friend';
import type { User, FriendRequest, Friend } from '@/types/user';

interface FriendState {
  friends: Friend[];
  friendRequests: FriendRequest[];
  searchResults: User[];
  isLoading: boolean;
  searchUsers: (query: string) => Promise<void>;
  sendFriendRequest: (userId: string, message: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  loadFriends: () => Promise<void>;
  loadFriendRequests: () => Promise<void>;
  clearSearchResults: () => void;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  friendRequests: [],
  searchResults: [],
  isLoading: false,

  searchUsers: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ isLoading: true });
    try {
      const users = await friendApi.searchUsers(query);
      const currentUserId = localStorage.getItem('userId');
      const currentUsername = localStorage.getItem('username');
      
      // Filter out current user and already friends
      const { friends } = get();
      const friendUserIds = new Set(friends.map(f => f.user._id));
      const friendUsernames = new Set(friends.map(f => f.user.username));
      
      const filteredUsers = users.filter(u => 
        u._id !== currentUserId && 
        u.username !== currentUsername &&
        !friendUserIds.has(u._id) &&
        !friendUsernames.has(u.username)
      );
      
      set({ searchResults: filteredUsers, isLoading: false });
    } catch (error) {
      console.error('Failed to search users:', error);
      set({ isLoading: false });
    }
  },

  sendFriendRequest: async (userId: string, message: string) => {
    try {
      await friendApi.sendFriendRequest(userId, message);
    } catch (error) {
      console.error('Failed to send friend request:', error);
      throw error;
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    try {
      await friendApi.acceptFriendRequest(requestId);
      set((state) => ({
        friendRequests: state.friendRequests.filter((r) => r._id !== requestId),
      }));
      // Reload friends list
      await get().loadFriends();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      throw error;
    }
  },

  rejectFriendRequest: async (requestId: string) => {
    try {
      await friendApi.rejectFriendRequest(requestId);
      set((state) => ({
        friendRequests: state.friendRequests.filter((r) => r._id !== requestId),
      }));
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      throw error;
    }
  },

  removeFriend: async (friendId: string) => {
    try {
      await friendApi.removeFriend(friendId);
      set((state) => ({
        friends: state.friends.filter((f) => f._id !== friendId),
      }));
    } catch (error) {
      console.error('Failed to remove friend:', error);
      throw error;
    }
  },

  blockUser: async (userId: string) => {
    try {
      await friendApi.blockUser(userId);
      set((state) => ({
        friends: state.friends.map((f) =>
          f.user._id === userId ? { ...f, isBlocked: true } : f
        ),
      }));
    } catch (error) {
      console.error('Failed to block user:', error);
      throw error;
    }
  },

  unblockUser: async (userId: string) => {
    try {
      await friendApi.unblockUser(userId);
      set((state) => ({
        friends: state.friends.map((f) =>
          f.user._id === userId ? { ...f, isBlocked: false } : f
        ),
      }));
    } catch (error) {
      console.error('Failed to unblock user:', error);
      throw error;
    }
  },

  loadFriends: async () => {
    set({ isLoading: true });
    try {
      const friends = await friendApi.getFriends();
      set({ friends, isLoading: false });
    } catch (error) {
      console.error('Failed to load friends:', error);
      set({ isLoading: false });
    }
  },

  loadFriendRequests: async () => {
    set({ isLoading: true });
    try {
      const requests = await friendApi.getFriendRequests();
      set({ friendRequests: requests, isLoading: false });
    } catch (error) {
      console.error('Failed to load friend requests:', error);
      set({ isLoading: false });
    }
  },

  clearSearchResults: () => set({ searchResults: [] }),
}));