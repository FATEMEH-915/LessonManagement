"use client";
import { 
  apiClient, 
  storeToken, 
  getToken, 
  removeToken, 
  handleApiError, 
  Classroom 
} from './apiClient';

export const authService = {
  login: async (username: string, password: string): Promise<{ access_token: string }> => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      storeToken(response.data.access_token);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: (): void => {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  getToken: (): string | null => getToken(),
  isAuthenticated: (): boolean => !!getToken(),

  validateToken: async (): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) return false;
      
      await apiClient.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return true;
    } catch (error) {
      return false;
    }
  }
};