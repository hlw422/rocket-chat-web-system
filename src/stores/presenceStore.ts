import { create } from 'zustand';

type UserStatus = 'online' | 'offline' | 'busy' | 'away';

interface PresenceState {
  userStatuses: Record<string, UserStatus>;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  batchUpdateStatuses: (updates: Record<string, UserStatus>) => void;
  getStatus: (userId: string) => UserStatus;
  getStatusText: (status: UserStatus) => string;
  getStatusColor: (status: UserStatus) => string;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  userStatuses: {},

  updateUserStatus: (userId: string, status: UserStatus) => {
    set((state) => ({
      userStatuses: { ...state.userStatuses, [userId]: status },
    }));
  },

  batchUpdateStatuses: (updates: Record<string, UserStatus>) => {
    set((state) => ({
      userStatuses: { ...state.userStatuses, ...updates },
    }));
  },

  getStatus: (userId: string) => {
    return get().userStatuses[userId] || 'offline';
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
