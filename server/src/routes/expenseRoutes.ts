import {
  createExpense,
  deleteExpense,
  getAllExpenses,
  getExpense,
  updateExpense,
} from "../controllers/expenseControllers.js";
import { Router } from "express";
import {
  createValidExpense,
  updateValidExpense,
} from "../validations/expenseValidations.js";
import { validate } from "../utils/validator.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getAllExpenses);

router.get("/:id", authMiddleware, getExpense);

router.post("/", authMiddleware, validate(createValidExpense), createExpense);

router.put("/:id", authMiddleware, validate(updateValidExpense), updateExpense);

router.delete("/:id", authMiddleware, deleteExpense);

export default router;
