import { create } from 'zustand';
import { chatApi } from '@/api/chat';
import { websocketService } from '@/services/websocket';
import type { Room, DirectMessageRoom } from '@/types/room';

interface ChatState {
  rooms: DirectMessageRoom[];
  activeRoom: DirectMessageRoom | null;
  unreadCounts: Record<string, number>;
  isLoading: boolean;
  isLoaded: boolean;
  loadRooms: () => Promise<void>;
  createDMRoom: (username: string) => Promise<DirectMessageRoom>;
  markAsRead: (roomId: string) => void;
  updateUnreadCount: (roomId: string, count: number) => void;
  setActiveRoom: (room: DirectMessageRoom | null) => void;
}

let isLoadingRooms = false;
let loadRoomsRetryCount = 0;
const MAX_RETRIES = 3;

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoom: null,
  unreadCounts: {},
  isLoading: false,
  isLoaded: false,

  setActiveRoom: (room) => {
    set({ activeRoom: room });
    if (room) {
      get().markAsRead(room._id);
    }
  },

  loadRooms: async () => {
    // Prevent concurrent calls
    if (isLoadingRooms) {
      console.log('[chatStore] Already loading rooms, skipping...');
      return;
    }

    isLoadingRooms = true;
    set({ isLoading: true });

    try {
      console.log('[chatStore] Loading rooms...');
      const serverRooms = await chatApi.getDMRooms();
      console.log('[chatStore] Server rooms response:', serverRooms);
      
      // Reset retry count on success
      loadRoomsRetryCount = 0;

      // Handle empty or invalid response
      if (!serverRooms || !Array.isArray(serverRooms)) {
        console.warn('[chatStore] Invalid rooms response, setting empty array');
        set({ rooms: [], isLoading: false, isLoaded: true });
        return;
      }

      // Deduplicate rooms by _id and filter out invalid rooms
      const uniqueRooms = serverRooms.reduce((acc, room) => {
        // Skip invalid rooms
        if (!room || !room._id || !room.usernames || room.usernames.length < 2) {
          console.warn('[chatStore] Skipping invalid room:', room);
          return acc;
        }
        // Skip duplicates
        if (!acc.some(r => r._id === room._id)) {
          acc.push(room);
        }
        return acc;
      }, [] as DirectMessageRoom[]);

      console.log('[chatStore] Processed rooms:', uniqueRooms);

      set({ 
        rooms: uniqueRooms, 
        isLoading: false,
        isLoaded: true 
      });

      // Subscribe to presence for each other user
      const currentUsername = localStorage.getItem('username');
      uniqueRooms.forEach((room) => {
        const otherUsername = room.usernames?.find((u) => u !== currentUsername);
        if (otherUsername) {
          websocketService.subscribeToPresenceByUsername(otherUsername);
        }
      });
    } catch (error) {
      console.error('[chatStore] Failed to load rooms:', error);
      set({ isLoading: false });
      
      // Retry on failure with exponential backoff
      if (loadRoomsRetryCount < MAX_RETRIES) {
        loadRoomsRetryCount++;
        const retryDelay = Math.min(2000 * Math.pow(2, loadRoomsRetryCount - 1), 10000);
        console.log(`[chatStore] Retrying loadRooms (${loadRoomsRetryCount}/${MAX_RETRIES}) in ${retryDelay}ms...`);
        // Keep isLoadingRooms true during retry delay to prevent concurrent calls
        setTimeout(() => {
          get().loadRooms();
        }, retryDelay);
        return; // Don't set isLoadingRooms to false yet
      }
    } finally {
      isLoadingRooms = false;
    }
  },

  createDMRoom: async (username: string) => {
    try {
      const room = await chatApi.createDM(username);
      const { rooms } = get();
      
      // Check if room already exists
      const existingRoom = rooms.find(r => r._id === room._id);
      if (existingRoom) {
        return existingRoom;
      }
      
      // Add new room to the top of the list
      set({ rooms: [room, ...rooms] });
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
