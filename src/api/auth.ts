import apiClient from './client';
import type { LoginResponse, ApiResponse } from '@/types/api';
import type { User } from '@/types/user';

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', {
      user: username,
      password,
    });
    return response.data;
  },

  register: async (data: {
    username: string;
    email: string;
    password: string;
    name: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await apiClient.post('/users.register', {
      username: data.username,
      email: data.email,
      pass: data.password,
      name: data.name,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/logout');
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get('/me');
    return response.data;
  },
};