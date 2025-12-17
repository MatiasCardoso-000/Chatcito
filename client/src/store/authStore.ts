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

          const { user, accessToken } = await response.data;

          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Conectar WebSocket
          socketService.connect(accessToken);
        } catch (error: any) {
          const errorMessage = error.response.data.error;

          if (get().errors.includes(errorMessage)) return;

          set({
            isAuthenticated: false,
            errors: [errorMessage, ...get().errors],
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
        const token = get().accessToken;

        const response = await authAPI.verifyToken();

        const { id } = response.data.userWithoutPassword;

        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const response = await authAPI.getMe(id);

          set({
            user: response.data.data,
            accessToken: token,
            isAuthenticated: true,
          });

          // Conectar WebSocket
          socketService.connect(token);
        } catch (error) {
          localStorage.removeItem("token");
          set({ user: null, accessToken: null, isAuthenticated: false });
          set({ errors: error as string[] });
          console.log(error);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
