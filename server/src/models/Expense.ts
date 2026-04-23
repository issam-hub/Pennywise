import mongoose, { Schema } from "mongoose";
import type { IExpense } from "../types/entities.js";

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const ExpenseModel = mongoose.model<IExpense>("expense", ExpenseSchema);

export default ExpenseModel;
