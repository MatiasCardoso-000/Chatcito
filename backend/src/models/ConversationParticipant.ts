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
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "conversation_id",
    },
  },
  {
    tableName: "conversation_participants",
    timestamps: true,
    underscored:false
  }
);
