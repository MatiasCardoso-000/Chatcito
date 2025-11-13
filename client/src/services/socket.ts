// src/services/socket.ts

import { io, Socket } from 'socket.io-client';
import type { Message } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket conectado');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket desconectado');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // ========== CHAT EVENTS ==========
  joinConversation(conversationId: number) {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: number) {
    this.socket?.emit('leave_conversation', conversationId);
  }

  sendMessage(conversationId: number, content: string) {
    this.socket?.emit('send_message', { conversationId, content });
  }

  typing(conversationId: number) {
    this.socket?.emit('typing', { conversationId });
  }

  stopTyping(conversationId: number) {
    this.socket?.emit('stop_typing', { conversationId });
  }

  markAsRead(conversationId: number) {
    this.socket?.emit('mark_as_read', { conversationId });
  }

  // ========== LISTENERS ==========
  onNewMessage(callback: (message: Message) => void) {
    this.socket?.on('new_message', callback);
  }

  onUserTyping(callback: (data: { userId: number; conversationId: number }) => void) {
    this.socket?.on('user_typing', callback);
  }

  onUserStopTyping(callback: (data: { userId: number; conversationId: number }) => void) {
    this.socket?.on('user_stop_typing', callback);
  }

  onMessagesRead(callback: (data: { conversationId: number; readBy: number }) => void) {
    this.socket?.on('messages_read', callback);
  }

  onUserOnline(callback: (data: { userId: number }) => void) {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback: (data: { userId: number }) => void) {
    this.socket?.on('user_offline', callback);
  }

  // Remover listeners
  off(event: string) {
    this.socket?.off(event);
  }
}

export const socketService = new SocketService();