import express from "express";
import { sequelize } from "./config/database";
import { router as userRoutes } from "./routes/user.routes";
import { router as postRoutes } from "./routes/post.routes";
import { router as commentsRoutes } from "./routes/comments.routes";
import { router as chatRoutes } from "./routes/chat.routes";
import { User } from "./models/user";
import { Post } from "./models/posts";
import { Comment } from "./models/comments";
import { PostLike } from "./models/likes";
import { Follow } from "./models/follow";
import { Conversation } from "./models/Conversation";
import { ConversationParticipant } from "./models/ConversationParticipant";
import { Message } from "./models/Message";
import { Server } from "socket.io";
import http from "node:http";
import cors from "cors";
import bodyParser from "cookie-parser"


const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization"],
  },
});

console.log("🔌 Socket.io configurado");

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(bodyParser())



app.use("/api/auth", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/conversations", chatRoutes);

import "./sockets/chatSocket";
import { initializeSocket } from "./sockets/chatSocket";
initializeSocket(io);

// Hacer io accesible en las rutas (opcional, para emitir eventos desde controladores)
app.set("io", io);

// Relaciones
//Usuario tiene varios posts
User.hasMany(Post, { onDelete: "CASCADE" });
Post.belongsTo(User);

//Usuario puede dar like a varios posts
User.belongsToMany(Post, {
  through: PostLike,
  as: "likedPosts",
  foreignKey: "likerId",
  otherKey: "postLikedId",
});

//Un post puede recibir varios likes
Post.belongsToMany(User, {
  through: PostLike,
  as: "likers",
  foreignKey: "postLikedId",
  otherKey: "likerId",
});

//Un usuario puede crear varios comentarios
User.hasMany(Comment, { onDelete: "CASCADE" });
Comment.belongsTo(User);

//Un post puede tener varios comentarios
Post.hasMany(Comment, { onDelete: "CASCADE" });
Comment.belongsTo(Post);

//Un usuario puede tener varios seguidores
User.belongsToMany(User, {
  through: Follow,
  as: "following",
  foreignKey: "follower_id",
});

//Un usuario puede tener varios seguidores
User.belongsToMany(User, {
  through: Follow,
  as: "followers",
  foreignKey: "following_id",
});

//Usuario puede participar en varias conversaciones
User.belongsToMany(Conversation, {
  through: ConversationParticipant,
  as: "conversations",
  foreignKey: "user_id",
});

//Conversación puede tener varios participantes
Conversation.belongsToMany(User, {
  through: ConversationParticipant,
  as: "participants",
  foreignKey: "conversation_id",
});

//Conversación contiene muchos mensajes
Conversation.hasMany(Message, {
  onDelete: "CASCADE",
  foreignKey: "conversation_id",
});

//Mensaje pertenece a una conversación
Message.belongsTo(Conversation, {
  foreignKey: "conversation_id",
});

//Usuario puede enviar muchos mensajes
User.hasMany(Message, {
  onDelete: "CASCADE",
  foreignKey: "sender_id",
  as: "sentMessages",
});

//Mensaje pertenece a un usuario remitente
Message.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✔Base de datos sincronizada");

    server.listen(process.env.PORT, () => {
      console.log(
        `🚀 Servidor corriendo en http://localhost:${process.env.PORT}`
      );
      console.log(`💬 WebSocket server en ws://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error sincronizando BD:", err);
  });
