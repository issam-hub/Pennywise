import {
  ExpenseCategory,
  type ApiResponse,
  type Expense,
} from "../types/index.js";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers.js";
import { AppError } from "../middleware/errorHandler.js";
import ExpenseModel from "../models/Expense.js";
import UserModel from "../models/User.js";

// export let fakeExpenses: Expense[] = [
//   {
//     id: "1",
//     userId: "user123",
//     amount: 45.99,
//     category: ExpenseCategory.FOOD,
//     description: "Lunch at restaurant",
//     date: new Date("2025-10-15"),
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
//   {
//     id: "2",
//     userId: "user123",
//     amount: 20.0,
//     category: ExpenseCategory.TRANSPORT,
//     description: "Uber to work",
//     date: new Date("2025-10-14"),
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },
// ];

export const getAllExpenses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { category, sort } = req.body;

    const filter: { userId: string; category?: string } = {
      userId: req.userId,
    };

    if (category && typeof category === "string") {
      filter.category = category;
    }

    let query = ExpenseModel.find(filter);

    if (sort && typeof sort === "string") {
      if (sort === "amount") {
        query = query.sort({ amount: 1 });
      } else if (sort === "-amount") {
        query = query.sort({ amount: -1 });
      } else if (sort === "date") {
        query = query.sort({ date: 1 });
      } else if (sort === "-date") {
        query = query.sort({ date: -1 });
      }
    }

    const expenses = await query;

    sendSuccess(res, expenses, "expenses returned successfully");
  },
);

export const getExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const expense = await ExpenseModel.findById(id);

    if (!expense) {
      throw new AppError("expense not found", 404);
    }

    if (expense.userId.toString() !== req.userId) {
      throw new AppError("unauthorized access to this expense", 403);
    }

    sendSuccess(res, expense, "expense returned successfully");
  },
);

export const createExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { amount, category, description, date } = req.body;

    const expense = new UserModel({
      userId: req.userId,
      amount,
      category,
      description,
      date: date ? new Date(date) : new Date(),
    });

    const createdExpense = await expense.save();

    sendSuccess(res, createdExpense, "expense created successfully", 201);
  },
);

export const updateExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;

    const expense = await ExpenseModel.findById(id);

    if (!expense) {
      throw new AppError("expense not found", 404);
    }

    if (expense.userId.toString() !== req.userId) {
      throw new AppError("unauthorized access to this expense", 403);
    }

    if (amount !== undefined) {
      expense.amount = amount;
    }
    if (category !== undefined) {
      expense.category = category;
    }

    if (description !== undefined) {
      expense.description = description;
    }

    if (date !== undefined) {
      expense.date = new Date(date);
    }

    const updatedExpense = await expense.save();

    sendSuccess(res, updatedExpense, "expense updated successfully");
  },
);

export const deleteExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const expense = await ExpenseModel.findById(id);
    if (!expense) {
      throw new AppError("user not found", 404);
    }

    if (expense.userId.toString() !== req.userId) {
      throw new AppError("unauthorized access to this expense", 403);
    }

    await ExpenseModel.findByIdAndDelete(id);

    sendSuccess(res, null, "expense deleted successfully");
  },
);
