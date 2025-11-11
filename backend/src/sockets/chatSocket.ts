// sockets/chatSocket.ts

import { Server, Socket } from "socket.io";
import { socketAuth } from "../middleware/socketAuth";
import { Message } from "../models/Message";
import { User } from "../models/user";
import { ConversationParticipant } from "../models/ConversationParticipant";

interface SocketWithUser extends Socket {
  userId?: number;
}

// Mapa de usuarios conectados: userId -> socketId
const connectedUsers = new Map<number, string>();

export const initializeSocket = (io: Server) => {
  // Middleware de autenticación
   io.use((socket, next) => socketAuth(socket as SocketWithUser, next));

  io.on("connection", (socket: SocketWithUser) => {
    const userId = socket.userId!;

    console.log(`✅ Usuario ${userId} conectado (socket: ${socket.id})`);

    // Registrar usuario conectado
    connectedUsers.set(userId, socket.id);

    // Notificar a otros que este usuario está online
    socket.broadcast.emit("user_online", { userId });

    // ========== EVENTO: Unirse a una conversación ==========
    socket.on("join_conversation", (conversationId: number) => {
      console.log(
        `👥 Usuario ${userId} se unió a conversación ${conversationId}`
      );
      socket.join(`conversation_${conversationId}`);
    });

    // ========== EVENTO: Salir de una conversación ==========
    socket.on("leave_conversation", (conversationId: number) => {
      console.log(
        `👋 Usuario ${userId} salió de conversación ${conversationId}`
      );
      socket.leave(`conversation_${conversationId}`);
    });

    // ========== EVENTO: Enviar mensaje ==========
    socket.on(
      "send_message",
      async (data: { conversationId: number; content: string }) => {
        try {
          const { conversationId, content } = data;

          // Validar que es participante
          const participant = await ConversationParticipant.findOne({
            where: {
              conversation_id: conversationId,
              user_id: userId,
            },
          });

          if (!participant) {
            socket.emit("error", {
              message: "No eres parte de esta conversación",
            });
            return;
          }

          // Crear mensaje en BD
          const message = await Message.create({
            conversation_id: conversationId,
            sender_id: userId,
            content: content.trim(),
            isRead: false,
          });

          // Obtener mensaje con datos del sender
          const messageWithSender = await Message.findByPk(
            message.get("id") as number,
            {
              include: [
                {
                  model: User,
                  as: "sender",
                  attributes: ["id", "username", "profileImage"],
                },
              ],
            }
          );

          // Emitir mensaje a todos los participantes de la conversación
          io.to(`conversation_${conversationId}`).emit(
            "new_message",
            messageWithSender
          );

          console.log(
            `💬 Mensaje ${message.get(
              "id"
            )} enviado en conversación ${conversationId}`
          );
        } catch (err) {
          console.error("Error enviando mensaje:", err);
          socket.emit("error", { message: "Error al enviar mensaje" });
        }
      }
    );

    // ========== EVENTO: Usuario está escribiendo ==========
    socket.on("typing", (data: { conversationId: number }) => {
      const { conversationId } = data;

      // Notificar a otros en la conversación (excepto el que escribe)
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        userId,
        conversationId,
      });
    });

    // ========== EVENTO: Usuario dejó de escribir ==========
    socket.on("stop_typing", (data: { conversationId: number }) => {
      const { conversationId } = data;

      socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
        userId,
        conversationId,
      });
    });

    // ========== EVENTO: Marcar mensajes como leídos ==========
    socket.on("mark_as_read", async (data: { conversationId: number }) => {
      try {
        const { conversationId } = data;

        // Actualizar lastRead del participante
        await ConversationParticipant.update(
          { lastRead: new Date() },
          {
            where: {
              conversation_id: conversationId,
              user_id: userId,
            },
          }
        );

        // Marcar mensajes como leídos
        await Message.update(
          { isRead: true },
          {
            where: {
              conversation_id: conversationId,
              sender_id: { $ne: userId },
              isRead: false,
            },
          }
        );

        // Notificar a otros participantes
        socket.to(`conversation_${conversationId}`).emit("messages_read", {
          conversationId,
          readBy: userId,
        });

        console.log(
          `✅ Mensajes leídos en conversación ${conversationId} por usuario ${userId}`
        );
      } catch (err) {
        console.error("Error marcando como leído:", err);
      }
    });

    // ========== EVENTO: Desconexión ==========
    socket.on("disconnect", () => {
      console.log(`❌ Usuario ${userId} desconectado`);

      // Remover de usuarios conectados
      connectedUsers.delete(userId);

      // Notificar a otros que este usuario está offline
      socket.broadcast.emit("user_offline", { userId });
    });
  });
};
