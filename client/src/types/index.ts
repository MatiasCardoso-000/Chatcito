// src/types/index.ts

export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  profileImage?: string;
  createdAt: string;
}

export interface Post {
  id: number;
  content: string;
  UserId: number;
  User: User;
  likesCount: number;
  commentsCount: number;
  isLikedByUser: boolean;
  isOwnPost: boolean;
  createdAt: string;
  updatedAt: string;
  author:string,
  timestamp: string
  avatar:string
}

export interface Comment {
  id: number;
  content: string;
  PostId: number;
  UserId: number;
  User: User;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: number;
  otherUser: User;
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: User;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: number;
  ConversationId: number;
  senderId: number;
  sender: User;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}