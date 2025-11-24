import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export const Follow = sequelize.define('Follow', {
 follower_id: {
  type: DataTypes.INTEGER,
  allowNull:false,
  field:"follower_id"
 },
  following_id: {
  type: DataTypes.INTEGER,
  allowNull:false,
  field:"following_id"
 },
}, { 
  tableName: 'follows',
  timestamps: true, 
  underscored:false
});