import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Conversation = sequelize.define(
  "Conversation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: "conversations",
    timestamps: true,
  }
);
