import { pgTable, serial, text, numeric, integer, timestamp, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const incomesTable = pgTable("incomes", {
  id: serial("id").primaryKey(),
  person: text("person").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  date: date("date").default(sql`CURRENT_DATE`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIncomeSchema = createInsertSchema(incomesTable).omit({ id: true, createdAt: true });
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Income = typeof incomesTable.$inferSelect;
