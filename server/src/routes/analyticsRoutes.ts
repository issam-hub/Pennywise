import { Router } from "express";
import {
  getDashboardStats,
  getExpensesByCategories,
  getMonthlyTotals,
  getSpendingTrends,
} from "../controllers/analyticsControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/by-category", authMiddleware, getExpensesByCategories);
router.get("/monthly", authMiddleware, getMonthlyTotals);
router.get("/dashboard-stats", authMiddleware, getDashboardStats);
router.get("/spending-trends", authMiddleware, getSpendingTrends);

export default router;
