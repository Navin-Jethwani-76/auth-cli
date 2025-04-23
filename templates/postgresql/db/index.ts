import { drizzle } from "drizzle-orm/node-postgres";
import * as dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });

export const DATABASE_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
const pool = new Pool({
  connectionString: DATABASE_URL,
});
const db = drizzle({ client: pool });

export default db;
