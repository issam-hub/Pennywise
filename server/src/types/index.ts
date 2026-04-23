import type { IExpense } from "./entities.js";

export enum ExpenseCategory {
  FOOD = "food",
  TRANSPORT = "transport",
  UTILITIES = "utilities",
  ENTERTAINMENT = "entertainment",
  HEALTHCARE = "healthcare",
  SHOPPING = "shopping",
  EDUCATION = "education",
  OTHER = "other",
}

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: Omit<User, "password">;
  token?: string;
}

export interface MonthtlyTotals {
  month: string;
  totals: number;
  count: number;
}

export interface DashboardStats {
  totalExpenses: number;
  expenseCount: number;
  roundedAverageExpenseAmount: number;
  highestExpense: IExpense;
  lowestExpense: IExpense;
  currentMonthTotal: number;
  lastMonthTotal: number;
  monthlyChange: number;
}
