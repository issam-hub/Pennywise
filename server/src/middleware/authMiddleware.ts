import type { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler.js";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = "user123";
  if (!userId) {
    throw new AppError("user not authenticated, please login", 401);
  }

  req.userId = userId;

  next();
};
