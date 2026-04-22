import { body } from "express-validator";
import { ExpenseCategory } from "../types/index.js";

export const createValidExpense = [
  body("amount").notEmpty().withMessage("amount is required"),
  body("category").notEmpty().withMessage("category is required"),
  body("description").trim().notEmpty().withMessage("description is required"),
  body("amount").isNumeric().withMessage("amount must be a number"),
  body("amount").custom((value) => {
    if (value <= 0) {
      throw new Error("amount must be greater than 0");
    }
    if (value > 1000000) {
      throw new Error("amount cannot exceed 1,000,000");
    }
    return true;
  }),
  body("category").custom((value) => {
    const validCategories = Object.values(ExpenseCategory);
    if (!validCategories.includes(value)) {
      throw new Error(
        `invalid category, must be one of: ${validCategories.join(", ")}`,
      );
    }
    return true;
  }),
  body("description")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("description must be between 3 and 100 characters"),
];

export const updateValidExpense = [
  body("amount").optional().isNumeric().withMessage("amount must be a number"),
  body("amount")
    .optional()
    .custom((value) => {
      if (value <= 0) {
        throw new Error("amount must be greater than 0");
      }
      if (value > 1000000) {
        throw new Error("amount cannot exceed 1,000,000");
      }
      return true;
    }),
  body("category")
    .optional()
    .custom((value) => {
      const validCategories = Object.values(ExpenseCategory);
      if (!validCategories.includes(value)) {
        throw new Error(
          `invalid category, must be one of: ${validCategories.join(", ")}`,
        );
      }
      return true;
    }),
  body("description")
    .trim()
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage("description must be between 3 and 100 character"),
];
