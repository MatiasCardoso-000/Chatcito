import { sequelize } from "../config/database";


export const PostLike = sequelize.define('PostLike', {
}, { 
  tableName: 'post_likes',
  timestamps: true 
});

