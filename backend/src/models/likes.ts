import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const PostLike = sequelize.define(
  "PostLike",
  {
    likerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'likerId' 
    },
    postLikedId: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'postLikedId'
    }
  },
  {
    tableName: "post_likes",
    timestamps: true,
    underscored: false 
  }
);