import type { Config } from "drizzle-kit";
require("dotenv").config({ path: ".env.local" });

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL as string,
    authToken: process.env.TURSO_DATABASE_AUTH_TOKEN as string,
  },
} satisfies Config;
