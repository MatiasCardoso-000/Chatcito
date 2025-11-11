import { Response, Request } from "express";
import { User } from "../models/user";
import { Conversation } from "../models/Conversation";
import { Op } from "sequelize";
import { sequelize } from "../config/database";
import { ConversationParticipant } from "../models/ConversationParticipant";
import { Message } from "../models/Message";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

const getOrCreateConversation = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params; //Con quien quiero hablar
    const currentUserId = req.user?.id;
    const otherUserId = parseInt(userId);

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (parseInt(currentUserId) === otherUserId) {
      return res.status(400).json({
        success: false,
        message: "No puedes crear una conversacion contigo mismo",
      });
    }

    // Verificar que el otro usuario existe
    const otherUser = await User.findByPk(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        succes: false,
        message: "Usuario no encontrado",
      });
    }

    // Buscar si ya existe una conversación entre estos 2 usuarios
    const conversations = await Conversation.findAll({
      include: [
        {
          model: User,
          as: "participants",
          attributes: ["id"],
          through: { attributes: [] },
          where: {
            id: { [Op.in]: [currentUserId, otherUserId] },
          },
        },
      ],
    });

    const existingConversation = conversations.find((convo) => {
      const participants = (convo.get("participants") as any[]) || [];
      const participantIds = participants.map((p) => p.id);
      return (
        participantIds.includes(currentUserId) &&
        participantIds.includes(otherUserId) &&
        participantIds.length === 2
      );
    });

    if (existingConversation) {
      const conversationId = existingConversation.get("id") as number;
      const conversation = await Conversation.findByPk(conversationId, {
        include: [
          {
            model: User,
            as: "participants",
            attributes: ["id", "username", "profileImage"],
            through: { attributes: [] },
          },
        ],
      });

      return res.json({
        succes: true,
        data: conversation,
        isNew: false,
      });
    }

    // Crear nueva conversación
    const transaction = await sequelize.transaction();
    try {
      const newConversation = await Conversation.create({}, { transaction });

      await ConversationParticipant.create(
        {
          conversation_id: newConversation.get("id"),
          user_id: currentUserId,
        },
        { transaction }
      );

      await ConversationParticipant.create(
        {
          conversation_id: newConversation.get("id"),
          user_id: otherUserId,
        },
        { transaction }
      );

      await transaction.commit();

      // Obtener conversación con participantes

      const newConversationId = newConversation.get("id") as number;

      const conversation = await Conversation.findByPk(newConversationId, {
        include: [
          {
            model: User,
            as: "participants",
            attributes: ["id", "username", "profileImage"],
            through: { attributes: [] },
          },
        ],
      });

      return res.status(201).json({
        success: true,
        data: conversation,
        isNew: true,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.log("Error en getOrCreateConversation", err);

    return res.status(500).json({
      success: false,
      message: "Error al crear/obtener conversación",
    });
  }
};

const sendMessage = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const currentUserId = req.user?.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        succes: false,
        message: "El contenido del mensaje es requerido",
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "El mensaje no puede tener mas de 1000 caracteres",
      });
    }

    // Verificar que la conversación existe
    const conversation = await Conversation.findByPk(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversacion no encontrada",
      });
    }

    // Verificar que el usuario es participante de la conversación
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: currentUserId,
      },
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "No eres participante de la conversacion",
      });
    }

    // Crear el mensaje
    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content.trim(),
      isRead: false,
    });

    // Obtener mensaje con datos del remitente
    const messageId = message.get("id") as number;

    const messageWithSender = await Message.findByPk(messageId, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "profileImage"],
        },
      ],
    });

    // Actualizar updatedAt de la conversación
    await conversation.update({ updateAt: new Date() });

    return res.status(201).json({
      success: true,
      data: messageWithSender,
    });
  } catch (error) {
    console.error("Error enviando el mensaje", error);

    return res.status(500).json({
      success: false,
      message: "Error al enviar el mensaje",
    });
  }
};

const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const currentUserId = req.user?.id;
    const { conversationId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    if (!currentUserId) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar que el usuario es participante
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: currentUserId,
      },
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "No tienes acceso a la conversacion",
      });
    }

    // Obtener mensajes

    const { count, rows: messages } = await Message.findAndCountAll({
      where: {
        conversation_id: conversationId,
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "username", "profileImage"],
        },
      ],
      order: [["createdAt", "ASC"]],
      limit,
      offset,
    });

    // Actualizar lastRead del participante

    await participant.update({ lastRead: new Date() });

    return res.json({
      success: true,
      data: messages.reverse(), // Invertir para que el más antiguo esté primero
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasMore: page < Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo mensajes:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener mensajes",
    });
  }
};

const getConversations = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      return res.status(404).json({
        succes: false,
        message: "Usuario no encontrado",
      });
    }

    // Obtener conversaciones del usuario

    const conversations = await Conversation.findAll({
      include: [
        {
          model: User,
          as: "participants",
          attributes: ["id", "username", "profileImage"],
          through: { attributes: ["lastRead"] },
        },
      ],
      where: {
        id: {
          [Op.in]: sequelize.literal(`(
        SELECT conversation_id 
        FROM conversation_participants
        WHERE user_id = ${currentUserId}
        )`),
        },
      },
      order: [["updatedAt", "DESC"]],
    });

    // Para cada conversación, obtener el último mensaje y contar no leídos
    const conversationWithData = await Promise.all(
      conversations.map(async (conversation) => {
        const convJSON = conversation.toJSON();

        const conversationId = conversation.get("id") as number;
        //Ultimo mensaje
        const lastMessage = await Message.findOne({
          where: {
            conversation_id: conversationId,
          },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "username", "profileImage"],
            },
          ],
        });

        // Contar mensajes no leídos
        const participant = await ConversationParticipant.findOne({
          where: {
            conversation_id: conversationId,
            user_id: currentUserId,
          },
        });

        const unreadCount = await Message.count({
          where: {
            conversation_id: conversationId,
            sender_id: { [Op.ne]: currentUserId }, // No mis mensajes
            createdAt: {
              [Op.gt]: participant?.get("lastRead") || new Date(0),
            },
          },
        });

        // Obtener info del otro participante

        const otherParticipant = convJSON.participants.find(
          (p: any) => p.id !== currentUserId
        );

        return {
          id: conversation.get("id"),
          otherUser: otherParticipant,
          lastMessage: lastMessage
            ? {
                content: lastMessage.get("content"),
                createdAt: lastMessage.get("createdAt"),
                sender: lastMessage.get("sender"),
              }
            : null,
          unreadCount,
          updatedAt: conversation.get("updatedAt"),
        };
      })
    );

    return res.json({
      success: true,
      data: conversationWithData,
    });
  } catch (error) {
    console.error("Error obteniendo conversaciones:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener conversaciones",
    });
  }
};

const markAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const currentUserId = req.user?.id;
    const { conversationId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    // Verificar que es participante
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: currentUserId,
      },
    });

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: "No tienes acceso a esta conversación",
      });
    }

    // Actualizar lastRead
    await participant.update({ lastRead: new Date() });

    // Marcar como leídos todos los mensajes que no son míos
    await Message.update(
      { isRead: true },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: currentUserId },
          isRead: false,
        },
      }
    );

    return res.json({
      success: true,
      message: "Mensajes marcados como leídos",
    });
  } catch (err) {
    console.error("Error marcando como leído:", err);
    return res.status(500).json({
      success: false,
      message: "Error al marcar mensajes como leídos",
    });
  }
};

export const chatController = {
  getOrCreateConversation,
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
};
