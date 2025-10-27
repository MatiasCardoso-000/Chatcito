import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Post = sequelize.define(
  "Post",
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
 
  },
  { tableName: "posts" }
);


