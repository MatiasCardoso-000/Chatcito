import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const PostLike = sequelize.define(
  "PostLike",
  {
    likerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'liker_id' 
    },
    postLikedId: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'postLiked_id'
    }
  },
  {
    tableName: "post_likes",
    timestamps: true,
    underscored: false 
  }
);