import { create } from 'zustand';
import { userApi } from '@/api/user';

type UserStatus = 'online' | 'offline' | 'busy' | 'away';

interface PresenceState {
  userStatuses: Record<string, UserStatus>;
  updateUserStatus: (username: string, status: UserStatus) => void;
  fetchUserStatus: (username: string) => Promise<void>;
  fetchMultipleUserStatuses: (usernames: string[]) => Promise<void>;
  getStatusByUsername: (username: string) => UserStatus;
  getStatusText: (status: UserStatus) => string;
  getStatusColor: (status: UserStatus) => string;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  userStatuses: {},

  updateUserStatus: (username: string, status: UserStatus) => {
    set((state) => ({
      userStatuses: { ...state.userStatuses, [username]: status },
    }));
  },

  fetchUserStatus: async (username: string) => {
    try {
      const user = await userApi.getUserByUsername(username);
      if (user && user.status) {
        get().updateUserStatus(username, user.status as UserStatus);
      }
    } catch (error) {
      console.warn(`Failed to fetch status for ${username}:`, error);
    }
  },

  fetchMultipleUserStatuses: async (usernames: string[]) => {
    const promises = usernames.map((username) => get().fetchUserStatus(username));
    await Promise.allSettled(promises);
  },

  getStatusByUsername: (username: string) => {
    return get().userStatuses[username] || 'offline';
  },

  getStatusText: (status: UserStatus) => {
    const map: Record<UserStatus, string> = {
      online: '在线',
      offline: '离线',
      busy: '忙碌',
      away: '离开',
    };
    return map[status] || '离线';
  },

  getStatusColor: (status: UserStatus) => {
    const map: Record<UserStatus, string> = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      busy: 'bg-red-500',
      away: 'bg-yellow-500',
    };
    return map[status] || 'bg-gray-400';
  },
}));
