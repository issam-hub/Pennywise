import { AppError } from "../middleware/errorHandler.js";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers.js";
import type { NextFunction, Request, Response } from "express";
import { fakeExpenses } from "./expenseControllers.js";
import type {
  DashboardStats,
  Expense,
  ExpenseCategory,
  MonthtlyTotals,
} from "../types/index.js";

export const getExpensesByCategories = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userExpenses = fakeExpenses.filter(
      (expense) => expense.userId === req.userId,
    );

    if (userExpenses.length === 0) {
      throw new AppError("no expenses found for this user", 404);
    }

    const categoryTotals = userExpenses.reduce(
      (acc: any, expense: Expense) => {
        if (!acc[expense.category]) {
          acc[expense.category] = { total: 0, count: 0 };
        }

        acc[expense.category].total += expense.amount;
        acc[expense.category].count += 1;
        return acc;
      },
      {} as Record<ExpenseCategory, { total: number; count: number }>,
    );

    const grandTotal = Object.values(categoryTotals).reduce(
      (sum: any, cat: any) => sum + cat.total,
      0,
    );

    const categoryArray = Object.entries(categoryTotals).map(
      ([category, catObj], _) => ({
        category,
        ...(catObj as {}),
        percentage:
          Math.round(
            ((catObj as { total: number }).total / (grandTotal as number)) *
              1000,
          ) / 10,
        total: Math.round((catObj as { total: number }).total * 100) / 100,
      }),
    );

    categoryArray.sort((a, b) => b.total - a.total);

    sendSuccess(
      res,
      categoryArray,
      "category breakdown retrieved successfully",
    );
  },
);

export const getMonthlyTotals = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = req.query.year
      ? Number(req.query.year)
      : new Date().getFullYear();

    if (isNaN(year)) {
      throw new AppError("year must be a valid number", 400);
    }

    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 1) {
      throw new AppError("year must be between 2000 and ${currentYear+1}", 400);
    }

    const userExpenses = fakeExpenses.filter((exp) => {
      const expenseYear = new Date(exp.date).getFullYear();
      return exp.userId === req.userId && expenseYear === year;
    });

    if (userExpenses.length === 0) {
      return sendSuccess(res, [], `no expenses found for ${year}`);
    }

    const monthlyTotals = userExpenses.reduce(
      (acc: any, exp: Expense) => {
        const monthString = getMonthString(new Date(exp.date));
        if (!acc[monthString]) {
          acc[monthString] = {
            month: monthString,
            total: 0,
            count: 0,
          };
        }
        acc[monthString].total += exp.amount;
        acc[monthString].count += 1;
        return acc;
      },
      {} as Record<string, MonthtlyTotals>,
    );

    const monthlyArray = Object.values(monthlyTotals);

    monthlyArray.sort((a: any, b: any) => a.month.localCompare(b.month));

    monthlyArray.forEach((month: any) => {
      month.total = Math.round(month.total * 100) / 100;
    });

    sendSuccess(
      res,
      monthlyArray,
      `monthly total for ${year} retrieved successfully`,
    );
  },
);

export const getDashboardStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userExpenses = fakeExpenses.filter(
      (expense) => expense.userId === req.userId,
    );

    if (userExpenses.length === 0) {
      sendSuccess(res, [], "no expenses found for this user");
      return;
    }

    const totalExpenses = userExpenses.reduce(
      (acc, exp) => acc + exp.amount,
      0,
    );

    const averageExpense = totalExpenses / userExpenses.length;
    const roundedAvg = Math.round(averageExpense * 10) / 10;

    const amounts = userExpenses.map((exp) => exp.amount);
    const maxAmount = Math.max(...amounts);
    const minAmount = Math.min(...amounts);

    const highestExpense = userExpenses.find((exp) => exp.amount === maxAmount);
    const lowestExpense = userExpenses.find((exp) => exp.amount === minAmount);

    const currentMonth = getCurrentMonth();
    const currentMonthExpenses = userExpenses.filter(
      (exp) => getMonthString(new Date(exp.date)) === currentMonth,
    );
    const currentMonthTotal = currentMonthExpenses.reduce(
      (acc, exp) => acc + exp.amount,
      0,
    );

    const lastMonth = getLastMonth();
    const lastMonthExpenses = userExpenses.filter(
      (exp) => getMonthString(new Date(exp.date)) === lastMonth,
    );
    const lastMonthTotal = lastMonthExpenses.reduce(
      (acc, exp) => acc + exp.amount,
      0,
    );

    let monthlyChange = 0;
    if (lastMonthTotal > 0) {
      monthlyChange =
        ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
      monthlyChange = Math.round(monthlyChange * 10) / 10;
    } else if (currentMonthTotal > 0) {
      monthlyChange = 100;
    }

    const stats: DashboardStats = {
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      expenseCount: userExpenses.length,
      roundedAverageExpenseAmount: roundedAvg,
      highestExpense: highestExpense as Expense,
      lowestExpense: lowestExpense as Expense,
      currentMonthTotal: Math.round(currentMonthTotal * 100) / 100,
      lastMonthTotal: Math.round(lastMonthTotal * 100) / 100,
      monthlyChange,
    };

    sendSuccess(res, stats, "dashboard stats retrieved successfully");
  },
);

export const getSpendingTrends = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userExpenses = fakeExpenses.filter(
      (expense) => expense.userId === req.userId,
    );

    if (userExpenses.length === 0) {
      sendSuccess(res, [], "no expenses found for this user");
      return;
    }

    const trends: (Omit<MonthtlyTotals, "totals"> & { total: number })[] = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      const monthString = getMonthString(date);
      const monthExpenses = userExpenses.filter(
        (exp) => getMonthString(exp.date) === monthString,
      );
      const monthTotal = monthExpenses.reduce(
        (acc, exp) => acc + exp.amount,
        0,
      );
      trends.push({
        month: monthString,
        total: Math.round(monthTotal * 100) / 100,
        count: monthExpenses.length,
      });
    }

    sendSuccess(res, trends, "spending trends retrieved successfully");
  },
);

const getMonthString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}-${year}`;
};

const getCurrentMonth = (): string => {
  return getMonthString(new Date());
};

const getLastMonth = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return getMonthString(date);
};
