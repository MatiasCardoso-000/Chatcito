// routes/chatRoutes.ts

import { Router } from 'express';
import { validateToken } from '../middleware/validateToken';
import { chatController } from '../controllers/chat.controller';

export const router = Router();

// Obtener o crear conversación con un usuario
router.get(
  '/with/:userId', 
  validateToken, 
  chatController.getOrCreateConversation
);

// Listar mis conversaciones
router.get(
  '/', 
  validateToken, 
  chatController.getConversations
);

// Obtener mensajes de una conversación
router.get(
  '/:conversationId/messages', 
  validateToken, 
  chatController.getMessages
);

// Enviar mensaje
router.post(
  '/:conversationId/messages', 
  validateToken, 
  chatController.sendMessage
);

// Marcar mensajes como leídos
router.put(
  '/:conversationId/read', 
  validateToken, 
  chatController.markAsRead
);

