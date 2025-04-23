// db/schema.ts
import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  text,
  datetime,
  serial,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordSalt: varchar("password_salt", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
});
