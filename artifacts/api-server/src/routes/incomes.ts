import { Router } from "express";
import { db, incomesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListIncomesQueryParams, CreateIncomeBody, UpdateIncomeBody, UpdateIncomeParams, DeleteIncomeParams } from "@workspace/api-zod";

const router = Router();

router.get("/incomes", async (req, res) => {
  const parsed = ListIncomesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { month, year, person } = parsed.data;

  const conditions = [];
  if (month !== undefined) conditions.push(eq(incomesTable.month, month));
  if (year !== undefined) conditions.push(eq(incomesTable.year, year));
  if (person !== undefined) conditions.push(eq(incomesTable.person, person));

  const rows = await db.select().from(incomesTable).where(conditions.length ? and(...conditions) : undefined).orderBy(incomesTable.createdAt);

  const result = rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
    createdAt: r.createdAt.toISOString(),
  }));
  res.json(result);
});

router.post("/incomes", async (req, res) => {
  const parsed = CreateIncomeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error });
    return;
  }
  const [row] = await db.insert(incomesTable).values({
    ...parsed.data,
    amount: String(parsed.data.amount),
  }).returning();

  res.status(201).json({
    ...row,
    amount: Number(row.amount),
    createdAt: row.createdAt.toISOString(),
  });
});

router.patch("/incomes/:id", async (req, res) => {
  const paramParsed = UpdateIncomeParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const bodyParsed = UpdateIncomeBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }

  const updateData: Record<string, unknown> = {};
  const b = bodyParsed.data;
  if (b.person !== undefined) updateData.person = b.person;
  if (b.type !== undefined) updateData.type = b.type;
  if (b.description !== undefined) updateData.description = b.description;
  if (b.amount !== undefined) updateData.amount = String(b.amount);
  if (b.month !== undefined) updateData.month = b.month;
  if (b.year !== undefined) updateData.year = b.year;

  const [row] = await db.update(incomesTable).set(updateData).where(eq(incomesTable.id, paramParsed.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    ...row,
    amount: Number(row.amount),
    createdAt: row.createdAt.toISOString(),
  });
});

router.delete("/incomes/:id", async (req, res) => {
  const paramParsed = DeleteIncomeParams.safeParse({ id: Number(req.params.id) });
  if (!paramParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(incomesTable).where(eq(incomesTable.id, paramParsed.data.id));
  res.status(204).send();
});

export default router;
