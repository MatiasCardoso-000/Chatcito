// types/socket.ts

export interface ServerToClientEvents {
  new_message: (message: any) => void;
  user_typing: (data: { userId: number; conversationId: number }) => void;
  user_stop_typing: (data: { userId: number; conversationId: number }) => void;
  messages_read: (data: { conversationId: number; readBy: number }) => void;
  user_online: (data: { userId: number }) => void;
  user_offline: (data: { userId: number }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  join_conversation: (conversationId: number) => void;
  leave_conversation: (conversationId: number) => void;
  send_message: (data: { conversationId: number; content: string }) => void;
  typing: (data: { conversationId: number }) => void;
  stop_typing: (data: { conversationId: number }) => void;
  mark_as_read: (data: { conversationId: number }) => void;
}