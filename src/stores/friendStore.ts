import { create } from 'zustand';
import { friendApi } from '@/api/friend';
import type { User, Friend } from '@/types/user';

interface FriendState {
  friends: Friend[];
  searchResults: User[];
  isLoading: boolean;
  searchUsers: (query: string) => Promise<void>;
  sendFriendRequest: (username: string, message: string) => Promise<void>;
  acceptFriendRequest: (username: string) => Promise<void>;
  removeFriend: (roomId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  loadFriends: () => Promise<void>;
  clearSearchResults: () => void;
}

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
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
      const { friends } = get();
      const friendUsernames = new Set(friends.map(f => f.user.username));
      
      const filteredUsers = users.filter(u => 
        u._id !== currentUserId && 
        u.username !== currentUsername &&
        !friendUsernames.has(u.username)
      );
      
      set({ searchResults: filteredUsers, isLoading: false });
    } catch (error) {
      console.error('Failed to search users:', error);
      set({ isLoading: false });
    }
  },

  sendFriendRequest: async (username: string, message: string) => {
    try {
      await friendApi.sendFriendRequest(username, message);
      set((state) => ({
        searchResults: state.searchResults.filter(u => u.username !== username),
      }));
    } catch (error) {
      console.error('Failed to send friend request:', error);
      throw error;
    }
  },

  acceptFriendRequest: async (username: string) => {
    try {
      await friendApi.acceptFriendRequest(username);
      await get().loadFriends();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      throw error;
    }
  },

  removeFriend: async (roomId: string) => {
    try {
      await friendApi.removeFriend(roomId);
      set((state) => ({
        friends: state.friends.filter(f => f._id !== roomId),
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
        friends: state.friends.map(f =>
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
        friends: state.friends.map(f =>
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

  clearSearchResults: () => set({ searchResults: [] }),
}));
