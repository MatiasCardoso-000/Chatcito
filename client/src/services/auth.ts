import type { ApiResponse, AuthResponse, User } from "../types";
import { api } from "./api";

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<AuthResponse>('/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  
  getMe: () =>
    api.get<ApiResponse<User>>(`/auth/users/${1}`),
};