import { create } from 'zustand';
import { messageApi } from '@/api/message';
import { chatApi } from '@/api/chat';
import type { Message } from '@/types/message';

interface MessageState {
  messages: Record<string, Message[]>;
  isLoading: boolean;
  loadMessages: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, text: string) => Promise<void>;
  deleteMessage: (roomId: string, messageId: string) => Promise<void>;
  addMessage: (roomId: string, message: Message) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  isLoading: false,

  loadMessages: async (roomId: string) => {
    set({ isLoading: true });
    try {
      const messages = await chatApi.getRoomMessages(roomId);
      set((state) => ({
        messages: {
          ...state.messages,
          [roomId]: messages,
        },
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (roomId: string, text: string) => {
    // Optimistic update: add message immediately with 'sending' status
    const tempMessage: Message = {
      _id: `temp_${Date.now()}`,
      rid: roomId,
      msg: text,
      ts: new Date(),
      u: {
        _id: localStorage.getItem('userId') || '',
        username: localStorage.getItem('username') || '',
      },
      status: 'sending',
    };

    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: [...(state.messages[roomId] || []), tempMessage],
      },
    }));

    try {
      const realMessage = await messageApi.sendMessage(roomId, text);
      // REST API succeeded — replace temp message with the real message from API.
      // The real message has the server-assigned _id, so if WebSocket also delivers it,
      // the existsById check in addMessage will deduplicate it.
      set((state) => ({
        messages: {
          ...state.messages,
          [roomId]: (state.messages[roomId] || []).map((m) =>
            m._id === tempMessage._id ? { ...realMessage, status: 'sent' as const } : m
          ),
        },
      }));
    } catch (error) {
      // Mark message as failed
      set((state) => ({
        messages: {
          ...state.messages,
          [roomId]: (state.messages[roomId] || []).map((m) =>
            m._id === tempMessage._id ? { ...m, status: undefined } : m
          ),
        },
      }));
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  deleteMessage: async (roomId: string, messageId: string) => {
    try {
      await messageApi.deleteMessage(roomId, messageId);
      set((state) => ({
        messages: {
          ...state.messages,
          [roomId]: (state.messages[roomId] || []).filter((m) => m._id !== messageId),
        },
      }));
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  },

  addMessage: (roomId: string, message: Message) => {
    set((state) => {
      const existingMessages = state.messages[roomId] || [];
      // Deduplicate: check if message already exists (by _id)
      const existsById = existingMessages.some(m => m._id === message._id);
      if (existsById) {
        return state; // No change needed
      }
      // Also check if this is a real message that replaces a temp optimistic message
      // Match by content + user + approximate time (within 5 seconds)
      const msgTime = new Date(message.ts).getTime();
      const filteredMessages = existingMessages.filter(m => {
        if (!m._id.startsWith('temp_')) return true;
        // This is a temp message - check if the incoming real message matches it
        const tempTime = new Date(m.ts).getTime();
        const timeDiff = Math.abs(msgTime - tempTime);
        const isDuplicate = m.msg === message.msg && 
                           m.u._id === message.u._id && 
                           timeDiff < 5000;
        return !isDuplicate; // Remove the temp if it matches
      });
      return {
        messages: {
          ...state.messages,
          [roomId]: [...filteredMessages, message],
        },
      };
    });
  },

  updateMessageStatus: (messageId: string, status: Message['status']) => {
    set((state) => {
      const newMessages = { ...state.messages };
      for (const roomId in newMessages) {
        newMessages[roomId] = newMessages[roomId].map((m) =>
          m._id === messageId ? { ...m, status } : m
        );
      }
      return { messages: newMessages };
    });
  },
}));