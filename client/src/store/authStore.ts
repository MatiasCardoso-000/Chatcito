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
  errors: string[];
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  update: (userId: number, data: { content: string }) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: localStorage.getItem("token") || null,
      isAuthenticated: false,
      isLoading: false,
      errors: [],

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ email, password });

          if (response.status !== 200) {
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
              errors: [...get().errors, response.data.error],
            });
          }

          const { user, accessToken } = await response.data;

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Conectar WebSocket
          socketService.connect(accessToken);
        } catch (error: unknown) {
          set({
            isAuthenticated: false,
          });

          throw error;
        } finally {
          set({ isLoading: false });
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
          const { accessToken, user } = response.data;

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Conectar WebSocket
          socketService.connect(accessToken);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        socketService.disconnect();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      checkAuth: async () => {
        const tokenResponse = await authAPI.verifyToken();
        const token = tokenResponse.data.accessToken;

        const { id } = tokenResponse.data.userWithoutPassword;

        if (!token) {
          set({ user: null, accessToken: null, isAuthenticated: false });
          return;
        }

        try {
          const response = await authAPI.getMe(id);
          // console.log(response);

          set({
            user: response.data.data,
            accessToken: token || tokenResponse.data.accessToken,
            isAuthenticated: true,
          });

          // Conectar WebSocket
          socketService.connect(token);
        } catch (error) {
          set({ user: null, accessToken: null, isAuthenticated: false });
          set({ errors: error as string[] });
          console.log(error);
        }
      },

      update: async (userId: number, data: { content: string }) => {
        const response = await authAPI.update(userId, data);
        console.log(response);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
