// src/store/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { authAPI } from '../services/auth';
import { socketService } from '../services/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          
          // Conectar WebSocket
          socketService.connect(token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register({ username, email, password });
          const { token, user } = response.data;
          
          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          
          // Conectar WebSocket
          socketService.connect(token);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        socketService.disconnect();
        set({ user: null, token: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const response = await authAPI.getMe();
          set({ user: response.data.data, token, isAuthenticated: true });
          
          // Conectar WebSocket
          socketService.connect(token);
        } catch (error) {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);