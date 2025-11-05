import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  String(process.env.DB_NAME),
  String(process.env.DB_USER),
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "postgres",
    logging: console.log
  },

);
