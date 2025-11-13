import type { ApiResponse, Conversation, Message, PaginatedResponse } from "../types";
import { api } from "./api";

export const chatAPI = {
  getConversations: () =>
    api.get<ApiResponse<Conversation[]>>('/'),
  
  getOrCreateConversation: (userId: number) =>
    api.get<ApiResponse<Conversation>>(`/with/${userId}`),
  
  getMessages: (conversationId: number, page = 1, limit = 50) =>
    api.get<PaginatedResponse<Message>>(
      `/${conversationId}/messages?page=${page}&limit=${limit}`
    ),
  
  sendMessage: (conversationId: number, content: string) =>
    api.post<ApiResponse<Message>>(
      `/${conversationId}/messages`,
      { content }
    ),
  
  markAsRead: (conversationId: number) =>
    api.put<ApiResponse<void>>(`/${conversationId}/read`),
};