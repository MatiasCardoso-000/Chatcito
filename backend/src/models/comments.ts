import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Comment = sequelize.define(
  "comment",
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);
