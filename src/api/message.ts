import apiClient from './client';
import type { Message } from '@/types/message';
import { chatApi } from './chat';

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
    const query = searchText.toLowerCase();
    const allMessages: Message[] = [];
    const pageSize = 100;
    const maxPages = 20;

    for (let page = 0; page < maxPages; page++) {
      const messages = await chatApi.getRoomMessages(roomId, {
        offset: page * pageSize,
        count: pageSize,
      });
      if (!messages || messages.length === 0) break;
      allMessages.push(...messages);
      if (messages.length < pageSize) break;
    }

    return allMessages.filter((m) => {
      if (m.msg?.toLowerCase().includes(query)) return true;
      if (m.file?.name?.toLowerCase().includes(query)) return true;
      if (m.attachments?.some((a) => a.title?.toLowerCase().includes(query))) return true;
      return false;
    });
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