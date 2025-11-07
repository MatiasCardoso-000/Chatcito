import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000],
      },
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Si el mensaje fue leído por el receptor",
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "sender_id",
    },
  },
  {
    tableName: "messages",
    timestamps: true, // createdAt = cuándo se envió
    underscored: false
  }
);
