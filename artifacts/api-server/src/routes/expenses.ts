import { Router } from "express";
import { db, expensesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListExpensesQueryParams, CreateExpenseBody, UpdateExpenseBody, UpdateExpenseParams, DeleteExpenseParams } from "@workspace/api-zod";

const router = Router();

router.get("/expenses", async (req, res) => {
  const parsed = ListExpensesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { month, year, person, category, type } = parsed.data;

  const conditions = [];
  if (month !== undefined) conditions.push(eq(expensesTable.month, month));
  if (year !== undefined) conditions.push(eq(expensesTable.year, year));
  if (person !== undefined) conditions.push(eq(expensesTable.person, person));
  if (category !== undefined) conditions.push(eq(expensesTable.category, category));
  if (type !== undefined) conditions.push(eq(expensesTable.expenseType, type));

  const rows = await db.select().from(expensesTable).where(conditions.length ? and(...conditions) : undefined).orderBy(expensesTable.createdAt);

  const result = rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
    monthlyAmount: Number(r.monthlyAmount),
    createdAt: r.createdAt.toISOString(),
  }));
  res.json(result);
});

router.post("/expenses", async (req, res) => {
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error });
    return;
  }

  const d = parsed.data;
  const amount = Number(d.amount);
  const isInstallment = d.isInstallment ?? false;
  const totalInstallments = d.totalInstallments ?? null;
  const monthlyAmount = isInstallment && totalInstallments && totalInstallments > 0
    ? amount / totalInstallments
    : amount;

  const [row] = await db.insert(expensesTable).values({
    person: d.person ?? null,
    description: d.description,
    amount: String(amount),
    monthlyAmount: String(monthlyAmount),
    category: d.category,
    expenseType: d.expenseType,
    paymentMethod: d.paymentMethod ?? null,
    isInstallment,
    totalInstallments,
    currentInstallment: d.currentInstallment ?? null,
    startMonth: d.startMonth ?? d.month,
    startYear: d.startYear ?? d.year,
    month: d.month,
    year: d.year,
  }).returning();

  res.status(201).json({
    ...row,
    amount: Number(row.amount),
    monthlyAmount: Number(row.monthlyAmount),
    createdAt: row.createdAt.toISOString(),
  });
});

router.patch("/expenses/:id", async (req, res) => {
  const paramParsed = UpdateExpenseParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateExpenseBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const b = bodyParsed.data;
  const updateData: Record<string, unknown> = {};
  if (b.person !== undefined) updateData.person = b.person;
  if (b.description !== undefined) updateData.description = b.description;
  if (b.category !== undefined) updateData.category = b.category;
  if (b.expenseType !== undefined) updateData.expenseType = b.expenseType;
  if (b.paymentMethod !== undefined) updateData.paymentMethod = b.paymentMethod;
  if (b.isInstallment !== undefined) updateData.isInstallment = b.isInstallment;
  if (b.totalInstallments !== undefined) updateData.totalInstallments = b.totalInstallments;
  if (b.currentInstallment !== undefined) updateData.currentInstallment = b.currentInstallment;
  if (b.startMonth !== undefined) updateData.startMonth = b.startMonth;
  if (b.startYear !== undefined) updateData.startYear = b.startYear;
  if (b.month !== undefined) updateData.month = b.month;
  if (b.year !== undefined) updateData.year = b.year;

  if (b.amount !== undefined) {
    const amount = Number(b.amount);
    updateData.amount = String(amount);
    const isInstallment = b.isInstallment ?? false;
    const totalInstallments = b.totalInstallments ?? null;
    const monthlyAmount = isInstallment && totalInstallments && totalInstallments > 0
      ? amount / totalInstallments
      : amount;
    updateData.monthlyAmount = String(monthlyAmount);
  }

  const [row] = await db.update(expensesTable).set(updateData).where(eq(expensesTable.id, paramParsed.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    ...row,
    amount: Number(row.amount),
    monthlyAmount: Number(row.monthlyAmount),
    createdAt: row.createdAt.toISOString(),
  });
});

router.delete("/expenses/:id", async (req, res) => {
  const paramParsed = DeleteExpenseParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(expensesTable).where(eq(expensesTable.id, paramParsed.data.id));
  res.status(204).send();
});

export default router;
