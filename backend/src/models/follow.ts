import { sequelize } from "../config/database";

export const Follow = sequelize.define('Follow', {
  // Solo timestamps
}, { 
  tableName: 'follows',
  timestamps: true 
});