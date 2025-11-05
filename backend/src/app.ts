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
//Un post puede tener varios likes
Post.belongsToMany(User, { through: PostLike, as: 'likers',foreignKey: 'postLikedId' , otherKey:"likerId" });

//Un usuario puede tener varios comentarios
User.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(User);

//Un post puede tener varios comentarios
Post.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(Post);

//Un usuario puede seguir a varias personas
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

sequelize.sync({ alter: true }).then(() => {
  app.listen(process.env.PORT, () =>
    console.log("Servidor corriendo en puerto ", process.env.PORT)
  );
});
