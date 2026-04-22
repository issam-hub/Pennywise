import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (process.env.NODE_ENV === "development") {
    console.error("Error: ", err);
    console.error("Stack: ", err.stack);
  } else {
    if (!err.isOperational) {
      console.log("Unexpected error: ", err);
    }
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `invalid ${err.path}: ${err.value}`;
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "your token has expired. please log in again";
  }

  const response: any = {
    success: false,
    error: message,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
