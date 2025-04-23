import type { Config } from "drizzle-kit";
import { DATABASE_URL } from "@/db";

export default {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: DATABASE_URL,
  },
} satisfies Config;
