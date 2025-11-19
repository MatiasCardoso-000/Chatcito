import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Post = sequelize.define(
  "Post",
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.NUMBER,
      allowNull: false,
      field: "user_id",
    },
  },
  {
    tableName: "posts",
    timestamps: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["created_at"],
      },
    ],
  }
);
