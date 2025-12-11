import type { ApiResponse, User } from "../types";
import { api } from "./api";

export const usersAPI = {
  getProfile: (userId: number) =>
    api.get<ApiResponse<User>>(`/${userId}`),
  getProfileByUsername: (username: string) =>
    api.get<ApiResponse<User>>(`/users/profile/${username}`),
  search: (query: string) =>
    api.get<ApiResponse<User[]>>(`/search?q=${query}`),
   toggleFollow: (userId: number) =>
    api.post<ApiResponse<{ following: boolean }>>(`/${userId}/follow`),
  
  getFollowers: (userId: number) =>
    api.get<ApiResponse<User[]>>(`/${userId}/followers`),
  
  getFollowing: (userId: number) =>
    api.get<ApiResponse<User[]>>(`/${userId}/following`),
};