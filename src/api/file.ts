import apiClient from './client';
import type { Message } from '@/types/message';

export const fileApi = {
  uploadFile: async (roomId: string, file: File, description?: string): Promise<Message | null> => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    if (description) {
      formData.append('msg', description);
    }

    try {
      const response = await apiClient.post(`/rooms.upload/${roomId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.message || null;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  },
};
