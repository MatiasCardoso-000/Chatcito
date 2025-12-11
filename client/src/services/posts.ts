import type { ApiResponse, PaginatedResponse, Post } from "../types";
import { api } from "./api";

export const postsAPI = {
  create: (content: string) =>
    api.post<ApiResponse<Post>>("/posts/", { content }),

  getFeed: (page = 1, limit = 10) => {
    return api.get<PaginatedResponse<Post>>(
      `/posts/feed?page=${page}&limit=${limit}`
    );
  },

  getPostsByUsername: (username: string, page = 1, limit = 10) => {
    return api.get<PaginatedResponse<Post>>(
      `/posts/user/${username}?page=${page}&limit=${limit}`
    );
  },

  getPosts: (page = 1, limit = 10) => {
    return api.get<PaginatedResponse<Post>>(
      `/posts/?page=${page}&limit=${limit}`
    );
  },

  getById: (userId: number) => {
    return api.get<ApiResponse<Post>>(`/posts/${userId}`);
  },

  update: (postId: number, content: string) => {
    return api.put<ApiResponse<Post>>(`/posts/update/${postId}`, { content });
  },

  deletePost: (postId: number) => {
    return api.delete<ApiResponse<void>>(`/posts/delete/${postId}`);
  },

  toggleLike: (postId: number) =>
    api.post<ApiResponse<{ liked: boolean }>>(`/posts/${postId}/like`),

  getCommentsCount: (postId: number) => {
    return api.get<ApiResponse<Post>>(`/posts/${postId}/comments/count`);
  },
};
