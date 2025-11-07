import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  String(process.env.DB_NAME),
  String(process.env.DB_USER),
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    dialect: "postgres",
    logging: console.log,
    define: {
      freezeTableName: true, // Evita pluralizar (usa el nombre exacto del modelo)
      underscored: true, // Convierte camelCase a snake_case en columnas (user_id en vez de UserId)
      timestamps: true, // Agrega created_at y updated_at automáticamente
    },
  }
);
