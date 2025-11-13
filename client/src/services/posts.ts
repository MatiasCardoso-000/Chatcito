import type { ApiResponse, PaginatedResponse, Post } from "../types";
import { api } from "./api";

export const postsAPI = {
  create: (content: string) =>
    api.post<ApiResponse<Post>>('/', { content }),
  
  getFeed: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Post>>(`/feed?page=${page}&limit=${limit}`),
  
  getAll: (page = 1, limit = 10) =>
    api.get<PaginatedResponse<Post>>(`/posts?page=${page}&limit=${limit}`),
  
  getById: (postId: number) =>
    api.get<ApiResponse<Post>>(`/${postId}`),
  
  update: (postId: number, content: string) =>
    api.put<ApiResponse<Post>>(`/${postId}`, { content }),
  
  delete: (postId: number) =>
    api.delete<ApiResponse<void>>(`/${postId}`),
  
  toggleLike: (postId: number) =>
    api.post<ApiResponse<{ liked: boolean }>>(`/${postId}/like`),
};