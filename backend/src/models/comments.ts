import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Comment = sequelize.define(
  "comment",
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 500], // Máximo 500 caracteres
      },
    },
  },
  {
    timestamps: true,
  }
);
