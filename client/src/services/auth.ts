import type {
  ApiResponse,
  AuthResponse,
  RefreshTokenResponse,
  User,
} from "../types";
import { api } from "./api";

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) => {
    return api.post<AuthResponse>("/auth/register", data);
  },
  login: (data: { email: string; password: string }) => {
    return api.post<AuthResponse>("/auth/login", data);
  },

  getMe: (id: number) => {
    return api.get<ApiResponse<User>>(`/auth/users/${id}`);
  },

  update: (id: number, data: { content: string }) => {
    return api.put<ApiResponse<User>>(`/auth/users/${id}/update`, data);
  },

  verifyToken: () => {
    return api.post<RefreshTokenResponse>("/auth/refresh-token");
  },
};
