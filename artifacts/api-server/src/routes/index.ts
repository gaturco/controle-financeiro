import { Router, type IRouter } from "express";
import healthRouter from "./health";
import incomesRouter from "./incomes";
import expensesRouter from "./expenses";
import summaryRouter from "./summary";

const router: IRouter = Router();

router.use(healthRouter);
router.use(incomesRouter);
router.use(expensesRouter);
router.use(summaryRouter);

export default router;
