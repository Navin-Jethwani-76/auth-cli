import { drizzle } from "drizzle-orm/mysql2";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const DATABASE_URL = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const db = drizzle(DATABASE_URL);

export default db;
