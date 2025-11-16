import type { ApiResponse, PaginatedResponse } from "../types";
import { api } from "./api";

export const commentsAPI = {
  create: (postId: number, content: string) =>
    api
  .post<ApiResponse<Comment>>(`/comments/${postId}`, { postId, content }),
  
  getByPost: (postId: number, page = 1, limit = 20) =>
    api.get<PaginatedResponse<Comment>>(
      `/comments/post/${postId}/comments?page=${page}&limit=${limit}`
    ),
  
  update: (commentId: number, content: string) =>
    api.put<ApiResponse<Comment>>(`/comments/${commentId}`, { content }),
  
  delete: (commentId: number) =>
    api.delete<ApiResponse<void>>(`/comments/${commentId}`),
};