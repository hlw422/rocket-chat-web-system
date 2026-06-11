import apiClient from './client';
import type { Room, DirectMessageRoom } from '@/types/room';

export const chatApi = {
  createDM: async (username: string): Promise<DirectMessageRoom> => {
    const response = await apiClient.post('/im.create', { username });
    return response.data.room;
  },

  getDMRooms: async (): Promise<DirectMessageRoom[]> => {
    const response = await apiClient.get('/im.list');
    return response.data.ims;
  },

  getRoomInfo: async (roomId: string): Promise<Room> => {
    const response = await apiClient.get(`/rooms.info?roomId=${roomId}`);
    return response.data.room;
  },

  getRoomMessages: async (roomId: string, options?: {
    offset?: number;
    count?: number;
    oldest?: string;
    latest?: string;
  }): Promise<any[]> => {
    const params = new URLSearchParams();
    params.append('roomId', roomId);
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.count) params.append('count', options.count.toString());
    if (options?.oldest) params.append('oldest', options.oldest);
    if (options?.latest) params.append('latest', options.latest);
    
    // Use im.history for direct messages, channels.history for channels
    // Since we primarily deal with DMs, use im.history which works for both
    const response = await apiClient.get(`/im.history?${params.toString()}`);
    return response.data.messages || [];
  },

  markAsRead: async (roomId: string): Promise<void> => {
    await apiClient.post('/subscriptions.read', { rid: roomId });
  },
};