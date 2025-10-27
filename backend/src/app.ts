import express from "express";
import { sequelize } from "./config/database";
import { router as userRoutes } from "./routes/userRoutes";
import { router as postRoutes } from "./routes/postRoutes";
import { User } from "./models/user";
import { Post } from "./models/posts";

const app = express();

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/posts", postRoutes);

User.hasMany(Post, { onDelete: "CASCADE" });
Post.belongsTo(User);

sequelize.sync({ alter: true }).then(() => {
  app.listen(process.env.PORT, () =>
    console.log("Servidor corriendo en puerto ", process.env.PORT)
  );
});
