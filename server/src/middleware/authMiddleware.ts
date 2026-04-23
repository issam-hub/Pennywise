import jwt from "jsonwebtoken";

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
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    throw new AppError("no token provided, please login", 401);
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new AppError("invalid token format. use: Bearer <token>", 401);
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in env file");
  }

  const decoded = jwt.verify(token as string, secret) as { userId: string };

  if (!decoded.userId) {
    throw new AppError("user not authenticated, please login", 401);
  }

  req.userId = decoded.userId;

  next();
};
