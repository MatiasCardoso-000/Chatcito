import express from "express";
import { sequelize } from "./config/database";
import { router as userRoutes } from "./routes/user.routes";
import { router as postRoutes } from "./routes/post.routes";
import { router as commentsRoutes } from "./routes/comments.routes";
import { User } from "./models/user";
import { Post } from "./models/posts";
import { Comment } from "./models/comments";
import { PostLike } from "./models/likes";
import { Follow } from "./models/follow";
import { Conversation } from "./models/Conversation";
import { ConversationParticipant } from "./models/ConversationParticipant";
import { Message } from "./models/Message";

const app = express();

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentsRoutes);

// Relaciones

//Usuario tiene varios posts
User.hasMany(Post, { onDelete: "CASCADE" });
Post.belongsTo(User);

//Usuario puede dar like a varios posts
User.belongsToMany(Post, { through: PostLike, as: 'likedPosts',foreignKey: 'likerId',otherKey:"postLikedId" });


//Un post puede recibir varios likes
Post.belongsToMany(User, { through: PostLike, as: 'likers',foreignKey: 'postLikedId' , otherKey:"likerId" });

//Un usuario puede crear varios comentarios
User.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(User);

//Un post puede tener varios comentarios
Post.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(Post);

//Un usuario puede tener varios seguidores
User.belongsToMany(User, { 
  through: Follow, 
  as: 'following', 
  foreignKey: 'followerId'
});

//Un usuario puede tener varios seguidores
User.belongsToMany(User, { 
  through: Follow, 
  as: 'followers', 
  foreignKey: 'followingId'
});


//Usuario puede participar en varias conversaciones
User.belongsToMany(Conversation, {
  through: ConversationParticipant,
  as:"conversations",
  foreignKey: "UserId"
})

//Conversación puede tener varios participantes
Conversation.belongsToMany(User, {
  through:ConversationParticipant,
  as:"participants",
  foreignKey:"ConversationId"
})

//Conversación contiene muchos mensajes
Conversation.hasMany(Message,{
  onDelete:"CASCADE",
  foreignKey:"ConversationId"
})

//Mensaje pertenece a una conversación
Message.belongsTo(Conversation, {
  foreignKey:"ConversationId"
})

//Usuario puede enviar muchos mensajes
User.hasMany(Message, { 
  onDelete:"CASCADE",
  foreignKey:"senderId",
  as: "sentMessages"
})

//Mensaje pertenece a un usuario remitente
Message.belongsTo(User, {
  foreignKey:"senderId",
  as:"sender"
})


sequelize.sync({ alter: true }).then(() => {
  app.listen(process.env.PORT, () =>
    console.log("Servidor corriendo en puerto ", process.env.PORT)
  );
});
