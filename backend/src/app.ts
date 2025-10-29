import express from "express";
import { sequelize } from "./config/database";
import { router as userRoutes } from "./routes/user.routes";
import { router as postRoutes } from "./routes/post.routes";
import { router as commentsRoutes } from "./routes/comments.routes";
import { User } from "./models/user";
import { Post } from "./models/posts";
import { Comment } from "./models/comments";

const app = express();

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentsRoutes);



// Relaciones
User.hasMany(Post, { onDelete: "CASCADE" });
Post.belongsTo(User);

User.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(User);

Post.hasMany(Comment, { onDelete: 'CASCADE' });
Comment.belongsTo(Post);

sequelize.sync({ alter: true }).then(() => {
  app.listen(process.env.PORT, () =>
    console.log("Servidor corriendo en puerto ", process.env.PORT)
  );
});
