// src/store/authStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
import { authAPI } from "../services/auth";
import { socketService } from "../services/socket";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ email, password });
          
          const { user, accessToken } = await response.data;
          
          localStorage.setItem("token", accessToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });

          // Conectar WebSocket
          socketService.connect(accessToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (username, email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register({
            username,
            email,
            password,
          });
          const {  accessToken, user } = response.data;

          localStorage.setItem("token", accessToken);
          set({ user,  accessToken, isAuthenticated: true, isLoading: false });

          // Conectar WebSocket
          socketService.connect(accessToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        socketService.disconnect();
        set({ user: null, accessToken:null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const token = localStorage.getItem("token");
        console.log(token);
        
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const response = await authAPI.getMe();
          set({ user: response.data.data, accessToken: token , isAuthenticated: true });

          // Conectar WebSocket
          socketService.connect(token);
        } catch (error) {
          localStorage.removeItem("token");
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.accessToken, user: state.user }),
    }
  )
);
