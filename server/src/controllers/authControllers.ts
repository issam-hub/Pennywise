import type { ApiResponse, AuthResponse, User } from "../types/index.js";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers.js";
import { AppError } from "../middleware/errorHandler.js";

let fakeUsers: User[] = [
  {
    id: "user123",
    name: "john Doe",
    email: "john@example.com",
    password: "password123",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "user456",
    name: "jane Smith",
    email: "jane@example.com",
    password: "password456",
    createdAt: new Date("2026-01-05"),
    updatedAt: new Date("2026-01-05"),
  },
];

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      const response: ApiResponse<null> = {
        success: false,
        error: "name, email and password not provided",
      };

      return res.status(400).json(response);
    }

    const existingUser = fakeUsers.some((user) => user.email === email);

    if (existingUser) {
      throw new AppError("email already exists", 400);
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fakeUsers.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;

    const authResponse: AuthResponse = {
      user: userWithoutPassword,
      token: "fake-jwt-token" + newUser.id,
    };

    sendSuccess(res, authResponse, "user signed up successfully", 201);
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = fakeUsers.find(
      (user) => user.email === email && user.password === password,
    );

    if (!user) {
      throw new AppError("invalid email or password", 401);
    }

    const { password: _, ...userWithoutPassword } = user;

    const authResponse: AuthResponse = {
      user: userWithoutPassword,
      token: "fake-jwt-token" + user.id,
    };

    sendSuccess(res, authResponse, "user logged in successfully", 200);
  },
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = fakeUsers.find((user) => user.id === req.userId);

    if (!user) {
      throw new AppError("user not found", 404);
    }

    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, userWithoutPassword, "profile returned successfully");
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email } = req.body;

    const userIndex = fakeUsers.findIndex((user) => user.id === req.userId);

    if (userIndex === -1) {
      throw new AppError("user not found", 404);
    }

    if (email !== fakeUsers[userIndex]?.email) {
      const emailExists = fakeUsers.find((user) => user.email === email);

      if (emailExists) {
        throw new AppError("email already in use", 409);
      }
      fakeUsers[userIndex] = {
        ...fakeUsers[userIndex],
        name: name || fakeUsers[userIndex]?.name,
        email: email || fakeUsers[userIndex]?.email,
        updatedAt: new Date(),
      } as User;
    }

    const { password: _, ...userWithoutPassword } = fakeUsers[
      userIndex
    ] as User;

    sendSuccess(res, userWithoutPassword, "profile updated successfully");
  },
);
