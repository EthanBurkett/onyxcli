import { DataSource } from "typeorm";

export default {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "Your postgres user password",
  database: "onyx",
  synchronize: true,
  logging: false,
  migrations: [],
  subscribers: [],
} as DataSource;
