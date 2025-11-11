// middlewares/socketAuth.ts

import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface SocketWithUser extends Socket {
  userId?: number;
}

export const socketAuth = (
  socket: SocketWithUser,
  next: (err?: Error) => void
) => {
  try {
    // Obtener token del handshake
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    console.log('🔍 Buscando token...');
    console.log('Auth:', socket.handshake.auth);
    console.log('Query:', socket.handshake.query);
    console.log('Token encontrado:', token ? 'Sí' : 'No');

    if (!token) {
      console.error('❌ Token no proporcionado');
      return next(new Error("Token no proporcionado"));
    }

    // Verificar token

     const secret = process.env.ACCES_TOKEN_SECRET || 'tu_secret_key';

    const decoded = jwt.verify(
      token,
      secret
    ) as { id: number };

    // Agregar userId al socket
    socket.userId = decoded.id;

    next();
  } catch (err) {
    console.error("Error en autenticación de socket:", err);
    next(new Error("Token inválido"));
  }
};
