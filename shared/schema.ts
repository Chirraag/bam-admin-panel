import { pgTable, text, serial, integer, boolean, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const crmUsers = pgTable("crm_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const columnMetadata = pgTable("column_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  columnName: text("column_name").notNull().unique(),
  columnType: text("column_type").notNull(),
  dropdownOptions: text("dropdown_options").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default(""),
  email: text("email").default(""),
  phone: text("phone").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCrmUserSchema = createInsertSchema(crmUsers).pick({
  email: true,
  passwordHash: true,
});

export const insertColumnMetadataSchema = createInsertSchema(columnMetadata).pick({
  columnName: true,
  columnType: true,
  dropdownOptions: true,
});

export const insertClientsSchema = createInsertSchema(clients).pick({
  name: true,
  email: true,
  phone: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCrmUser = z.infer<typeof insertCrmUserSchema>;
export type CrmUser = typeof crmUsers.$inferSelect;
export type InsertColumnMetadata = z.infer<typeof insertColumnMetadataSchema>;
export type ColumnMetadata = typeof columnMetadata.$inferSelect;
export type InsertClients = z.infer<typeof insertClientsSchema>;
export type Clients = typeof clients.$inferSelect;
