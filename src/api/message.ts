import apiClient from './client';
import type { Message } from '@/types/message';

export const messageApi = {
  sendMessage: async (roomId: string, text: string): Promise<Message> => {
    const response = await apiClient.post('/chat.sendMessage', {
      message: {
        rid: roomId,
        msg: text,
      },
    });
    return response.data.message;
  },

  updateMessage: async (roomId: string, messageId: string, text: string): Promise<Message> => {
    const response = await apiClient.post('/chat.update', {
      roomId,
      msgId: messageId,
      text,
    });
    return response.data.message;
  },

  deleteMessage: async (roomId: string, messageId: string): Promise<void> => {
    await apiClient.post('/chat.delete', {
      roomId,
      msgId: messageId,
    });
  },

  searchMessages: async (roomId: string, searchText: string): Promise<Message[]> => {
    const response = await apiClient.get(`/chat.search?roomId=${roomId}&searchText=${encodeURIComponent(searchText)}`);
    return response.data.messages;
  },

  reactToMessage: async (messageId: string, emoji: string): Promise<void> => {
    await apiClient.post('/chat.react', {
      messageId,
      emoji,
    });
  },

  pinMessage: async (messageId: string): Promise<void> => {
    await apiClient.post('/chat.pinMessage', { messageId });
  },

  unpinMessage: async (messageId: string): Promise<void> => {
    await apiClient.post('/chat.unPinMessage', { messageId });
  },

  starMessage: async (messageId: string): Promise<void> => {
    await apiClient.post('/chat.starMessage', { messageId });
  },

  unstarMessage: async (messageId: string): Promise<void> => {
    await apiClient.post('/chat.unStarMessage', { messageId });
  },
};