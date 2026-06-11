import apiClient from './client';
import type { User } from '@/types/user';

export const userApi = {
  getUserInfo: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/users.info?userId=${userId}`);
    return response.data.user;
  },

  getUserByUsername: async (username: string): Promise<User> => {
    const response = await apiClient.get(`/users.info?username=${username}`);
    return response.data.user;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get(`/users.list?query={"$or":[{"username":{"$regex":"${query}","$options":"i"}},{"name":{"$regex":"${query}","$options":"i"}},{"emails.address":{"$regex":"${query}","$options":"i"}}]}`);
    return response.data.users;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.post('/users.update', data);
    return response.data.user;
  },

  updateStatus: async (status: string, message?: string): Promise<void> => {
    await apiClient.post('/users.setStatus', { status, message });
  },
};