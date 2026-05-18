import { pgTable, serial, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const expensesTable = pgTable("expenses", {
  id: serial("id").primaryKey(),
  person: text("person"),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  monthlyAmount: numeric("monthly_amount", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  expenseType: text("expense_type").notNull(),
  paymentMethod: text("payment_method"),
  isInstallment: boolean("is_installment").notNull().default(false),
  totalInstallments: integer("total_installments"),
  currentInstallment: integer("current_installment"),
  startMonth: integer("start_month").notNull(),
  startYear: integer("start_year").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expensesTable).omit({ id: true, createdAt: true });
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expensesTable.$inferSelect;
