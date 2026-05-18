import { Router } from "express";
import { db, incomesTable, expensesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { GetMonthlySummaryQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/summary", async (req, res) => {
  const parsed = GetMonthlySummaryQueryParams.safeParse({
    month: Number(req.query.month),
    year: Number(req.query.year),
  });
  if (!parsed.success) {
    res.status(400).json({ error: "month and year are required" });
    return;
  }
  const { month, year } = parsed.data;

  const [incomeRows, expenseRows] = await Promise.all([
    db.select().from(incomesTable).where(and(eq(incomesTable.month, month), eq(incomesTable.year, year))),
    db.select().from(expensesTable).where(and(eq(expensesTable.month, month), eq(expensesTable.year, year))),
  ]);

  const totalIncome = incomeRows.reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = expenseRows.reduce((s, r) => s + Number(r.monthlyAmount), 0);

  const fixedTotal = expenseRows.filter(r => r.expenseType === "fixo").reduce((s, r) => s + Number(r.monthlyAmount), 0);
  const variableTotal = expenseRows.filter(r => r.expenseType === "variavel").reduce((s, r) => s + Number(r.monthlyAmount), 0);
  const obraTotal = expenseRows.filter(r => r.category === "obra").reduce((s, r) => s + Number(r.monthlyAmount), 0);

  const categoryMap: Record<string, number> = {};
  for (const r of expenseRows) {
    categoryMap[r.category] = (categoryMap[r.category] ?? 0) + Number(r.monthlyAmount);
  }
  const expensesByCategory = Object.entries(categoryMap).map(([category, total]) => ({ category, total }));

  const personMap: Record<string, number> = {};
  for (const r of incomeRows) {
    personMap[r.person] = (personMap[r.person] ?? 0) + Number(r.amount);
  }
  const incomeByPerson = Object.entries(personMap).map(([category, total]) => ({ category, total }));

  res.json({
    month,
    year,
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    fixedTotal,
    variableTotal,
    obraTotal,
    expensesByCategory,
    incomeByPerson,
  });
});

router.get("/obra-summary", async (req, res) => {
  const rows = await db.select().from(expensesTable).where(eq(expensesTable.category, "obra"));

  const totalInvested = rows.reduce((s, r) => s + Number(r.amount), 0);
  const monthlyCommitment = rows
    .filter(r => r.isInstallment)
    .reduce((s, r) => s + Number(r.monthlyAmount), 0);

  const items = rows.map(r => ({
    id: r.id,
    description: r.description,
    amount: Number(r.amount),
    monthlyAmount: Number(r.monthlyAmount),
    isInstallment: r.isInstallment,
    totalInstallments: r.totalInstallments,
    currentInstallment: r.currentInstallment,
    startMonth: r.startMonth,
    startYear: r.startYear,
    paymentMethod: r.paymentMethod,
  }));

  res.json({ totalInvested, monthlyCommitment, items });
});

export default router;
