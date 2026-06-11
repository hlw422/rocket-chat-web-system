import { create } from 'zustand';

interface SocketState {
  isConnected: boolean;
  isReconnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribeToRoom: (roomId: string) => void;
  unsubscribeFromRoom: (roomId: string) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  isReconnecting: false,

  connect: async () => {
    // WebSocket connection will be implemented here
    set({ isConnected: true });
  },

  disconnect: () => {
    set({ isConnected: false });
  },

  subscribeToRoom: (roomId: string) => {
    console.log('Subscribing to room:', roomId);
  },

  unsubscribeFromRoom: (roomId: string) => {
    console.log('Unsubscribing from room:', roomId);
  },
}));