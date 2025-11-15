// src/services/authService.ts
import apiClient from './api';

export const authService = {
  setup: async (userData: any) => {
    const response = await apiClient.post('/auth/setup/', userData);
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return user;
  },
  login: async (credentials: any) => {
    const response = await apiClient.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return user;
  },
  logout: async () => {
    const refresh = localStorage.getItem('refresh_token');
    await apiClient.post('/auth/logout/', { refresh });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
