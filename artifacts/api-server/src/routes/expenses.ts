import { Router } from "express";
import { db, expensesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
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

  const rows = await db.select().from(expensesTable).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(expensesTable.date), desc(expensesTable.createdAt));

  const result = rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
    monthlyAmount: Number(r.monthlyAmount),
    createdAt: r.createdAt.toISOString(),
  }));
  res.json(result);
});

function shiftMonth(month: number, year: number, offset: number) {
  const d = new Date(year, month - 1 + offset, 1);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

function shiftDate(dateStr: string, offset: number): string {
  const [y, m, day] = dateStr.split("-").map(Number);
  const d = new Date(y, m - 1 + offset, day);
  // clamp to last day of month if overflow (e.g. Jan 31 → Feb 28)
  if (d.getMonth() !== ((m - 1 + offset) % 12 + 12) % 12) d.setDate(0);
  return d.toISOString().split("T")[0];
}

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

  const startMonth = d.startMonth ?? d.month;
  const startYear = d.startYear ?? d.year;
  const startDate = d.date ?? new Date().toISOString().split("T")[0];

  if (isInstallment && totalInstallments && totalInstallments > 1) {
    const rows = Array.from({ length: totalInstallments }, (_, i) => {
      const { month, year } = shiftMonth(startMonth, startYear, i);
      return {
        person: d.person ?? null,
        description: d.description,
        amount: String(amount),
        monthlyAmount: String(monthlyAmount),
        category: d.category,
        expenseType: d.expenseType,
        paymentMethod: d.paymentMethod ?? null,
        isInstallment: true,
        totalInstallments,
        currentInstallment: i + 1,
        startMonth,
        startYear,
        month,
        year,
        date: shiftDate(startDate, i),
      };
    });

    const inserted = await db.insert(expensesTable).values(rows).returning();
    const first = inserted[0];
    res.status(201).json({
      ...first,
      amount: Number(first.amount),
      monthlyAmount: Number(first.monthlyAmount),
      createdAt: first.createdAt.toISOString(),
    });
    return;
  }

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
    startMonth,
    startYear,
    month: d.month,
    year: d.year,
    date: startDate,
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
