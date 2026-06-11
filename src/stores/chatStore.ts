import { create } from 'zustand';
import { chatApi } from '@/api/chat';
import type { Room, DirectMessageRoom } from '@/types/room';

interface ChatState {
  rooms: DirectMessageRoom[];
  activeRoom: DirectMessageRoom | null;
  unreadCounts: Record<string, number>;
  isLoading: boolean;
  setActiveRoom: (room: DirectMessageRoom | null) => void;
  loadRooms: () => Promise<void>;
  createDMRoom: (username: string) => Promise<DirectMessageRoom>;
  markAsRead: (roomId: string) => void;
  updateUnreadCount: (roomId: string, count: number) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoom: null,
  unreadCounts: {},
  isLoading: false,

  setActiveRoom: (room) => {
    set({ activeRoom: room });
    if (room) {
      get().markAsRead(room._id);
    }
  },

  loadRooms: async () => {
    set({ isLoading: true });
    try {
      const rooms = await chatApi.getDMRooms();
      set({ rooms, isLoading: false });
    } catch (error) {
      console.error('Failed to load rooms:', error);
      set({ isLoading: false });
    }
  },

  createDMRoom: async (username: string) => {
    try {
      const room = await chatApi.createDM(username);
      const { rooms } = get();
      if (!rooms.find(r => r._id === room._id)) {
        set({ rooms: [room, ...rooms] });
      }
      return room;
    } catch (error) {
      console.error('Failed to create DM room:', error);
      throw error;
    }
  },

  markAsRead: (roomId: string) => {
    chatApi.markAsRead(roomId).catch(console.error);
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [roomId]: 0,
      },
    }));
  },

  updateUnreadCount: (roomId: string, count: number) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [roomId]: count,
      },
    }));
  },
}));