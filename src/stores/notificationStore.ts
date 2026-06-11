import { create } from 'zustand';

interface NotificationState {
  hasPermission: boolean;
  soundEnabled: boolean;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, body: string, icon?: string) => void;
  toggleSound: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  hasPermission: false,
  soundEnabled: true,

  requestPermission: async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      set({ hasPermission: permission === 'granted' });
    }
  },

  sendNotification: (title: string, body: string, icon?: string) => {
    const { hasPermission, soundEnabled } = get();
    
    if (hasPermission && 'Notification' in window) {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
      });
    }

    if (soundEnabled) {
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(console.error);
    }
  },

  toggleSound: () => {
    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },
}));