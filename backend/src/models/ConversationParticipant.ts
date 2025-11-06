import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const ConversationParticipant = sequelize.define(
  "ConversationParticipant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    lastRead: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Última vez que el usuario leyó mensajes",
    },
  },
  {
    tableName: "conversation_participants",
    timestamps: true,
  }
);
