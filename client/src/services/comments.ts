import type { ApiResponse, PaginatedResponse } from "../types";
import { api } from "./api";

export const commentsAPI = {
  create: (postId: number, content: string) =>
    api
  .post<ApiResponse<Comment>>('/', { postId, content }),
  
  getByPost: (postId: number, page = 1, limit = 20) =>
    api.get<PaginatedResponse<Comment>>(
      `/${postId}/comments?page=${page}&limit=${limit}`
    ),
  
  update: (commentId: number, content: string) =>
    api.put<ApiResponse<Comment>>(`/${commentId}`, { content }),
  
  delete: (commentId: number) =>
    api.delete<ApiResponse<void>>(`/${commentId}`),
};