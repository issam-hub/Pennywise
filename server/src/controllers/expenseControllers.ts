import {
  ExpenseCategory,
  type ApiResponse,
  type Expense,
} from "../types/index.js";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers.js";
import { AppError } from "../middleware/errorHandler.js";

export let fakeExpenses: Expense[] = [
  {
    id: "1",
    userId: "user123",
    amount: 45.99,
    category: ExpenseCategory.FOOD,
    description: "Lunch at restaurant",
    date: new Date("2025-10-15"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    userId: "user123",
    amount: 20.0,
    category: ExpenseCategory.TRANSPORT,
    description: "Uber to work",
    date: new Date("2025-10-14"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const getAllExpenses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userExpenses = fakeExpenses.filter(
      (exp) => exp.userId === req.userId,
    );

    const { category, sort } = req.body;

    let filteredExpenses = [...userExpenses];

    if (category && typeof category === "string") {
      filteredExpenses = filteredExpenses.filter(
        (exp) => exp.category === category,
      );
    }

    if (sort && typeof sort === "string") {
      if (sort === "amount") {
        filteredExpenses.sort((a, b) => a.amount - b.amount);
      } else if (sort === "-amount") {
        filteredExpenses.sort((a, b) => b.amount - a.amount);
      } else if (sort === "date") {
        filteredExpenses.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      } else if (sort === "-date") {
        filteredExpenses.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      }
    }

    sendSuccess(res, filteredExpenses, "expenses returned successfully");
  },
);

export const getExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const expense = fakeExpenses.find(
      (exp) => exp.id === id && exp.userId === req.userId,
    );

    if (!expense) {
      throw new AppError("expense not found", 404);
    }

    sendSuccess(res, expense, "expense returned successfully");
  },
);

export const createExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { amount, category, description, date } = req.body;

    const expense: Expense = {
      id: crypto.randomUUID(),
      userId: req.userId,
      amount,
      category,
      description,
      date: date ? new Date(date) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fakeExpenses.push(expense);

    sendSuccess(res, expense, "expense created successfully", 201);
  },
);

export const updateExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;

    const expenseId = fakeExpenses.findIndex(
      (exp) => exp.id === id && exp.userId === req.userId,
    );

    if (expenseId === -1) {
      throw new AppError("expense not found", 404);
    }

    fakeExpenses[expenseId] = {
      ...fakeExpenses[expenseId],
      amount: amount || fakeExpenses[expenseId]?.amount,
      category: category || fakeExpenses[expenseId]?.category,
      description: description || fakeExpenses[expenseId]?.description,
      date: date ? new Date(date) : (fakeExpenses[expenseId] as Expense).date,
      updatedAt: new Date(),
    } as Expense;

    sendSuccess(res, fakeExpenses[expenseId], "expense updated successfully");
  },
);

export const deleteExpense = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const expenseId = fakeExpenses.findIndex(
      (exp) => exp.id === id && exp.userId === req.userId,
    );

    if (expenseId === -1) {
      throw new AppError("expense not found", 404);
    }

    fakeExpenses.splice(expenseId, 1);

    sendSuccess(res, null, "expense deleted successfully");
  },
);
