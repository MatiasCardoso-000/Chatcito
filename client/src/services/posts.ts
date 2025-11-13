import type { ApiResponse, PaginatedResponse, Post } from "../types";
import { api, API_URL } from "./api";

export const postsAPI = {
  create: (content: string) => api.post<ApiResponse<Post>>("/", { content }),

  getFeed: (page = 1, limit = 10) => {
    return api.get<PaginatedResponse<Post>>(
      `/feed?page=${page}&limit=${limit}`
    );
  },

  getPosts: (page = 1, limit = 10) => {
    return fetch(`${API_URL}/posts`, {
      method: "GET",
      credentials: "include",
    }).then(res =>res.json() as Promise<ApiResponse<PaginatedResponse<Post>>>);
  },

  getById: (postId: number) => api.get<ApiResponse<Post>>(`/${postId}`),

  update: (postId: number, content: string) =>
    api.put<ApiResponse<Post>>(`/${postId}`, { content }),

  delete: (postId: number) => api.delete<ApiResponse<void>>(`/${postId}`),

  toggleLike: (postId: number) =>
    api.post<ApiResponse<{ liked: boolean }>>(`/${postId}/like`),
};
