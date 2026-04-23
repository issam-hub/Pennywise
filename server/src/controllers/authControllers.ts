import type { ApiResponse, AuthResponse, User } from "../types/index.js";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers.js";
import { AppError } from "../middleware/errorHandler.js";
import UserModel from "../models/User.js";

// let fakeUsers: User[] = [
//   {
//     id: "user123",
//     name: "john Doe",
//     email: "john@example.com",
//     password: "password123",
//     createdAt: new Date("2026-01-01"),
//     updatedAt: new Date("2026-01-01"),
//   },
//   {
//     id: "user456",
//     name: "jane Smith",
//     email: "jane@example.com",
//     password: "password456",
//     createdAt: new Date("2026-01-05"),
//     updatedAt: new Date("2026-01-05"),
//   },
// ];

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

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new AppError("email already exists", 400);
    }

    const newUser = new UserModel({
      name,
      email,
      password,
    });

    const savedUser = await newUser.save();

    const savedUserObj = savedUser.toObject();

    const { password: _, ...userWithoutPassword } = savedUserObj;

    const authResponse: AuthResponse = {
      user: { ...userWithoutPassword, _id: savedUserObj._id.toString() },
      token: "fake-jwt-token" + savedUserObj._id.toString(),
    };

    sendSuccess(res, authResponse, "user signed up successfully", 201);
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email, password });

    if (!user) {
      throw new AppError("invalid email or password", 401);
    }

    const userObj = user.toObject();

    const { password: _, ...userWithoutPassword } = userObj;

    const authResponse: AuthResponse = {
      user: { ...userWithoutPassword, _id: userObj._id.toString() },
      token: "fake-jwt-token" + userObj._id.toString(),
    };

    sendSuccess(res, authResponse, "user logged in successfully", 200);
  },
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      throw new AppError("user not found", 404);
    }

    const userObj = user.toObject();

    const { password: _, ...userWithoutPassword } = userObj;

    sendSuccess(
      res,
      { ...userWithoutPassword, _id: userObj._id.toString() },
      "profile returned successfully",
    );
  },
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email } = req.body;

    const user = await UserModel.findById(req.userId);

    if (!user) {
      throw new AppError("user not found", 404);
    }

    if (email !== user.email) {
      const emailExists = await UserModel.findOne({
        email,
        _id: { $ne: req.userId },
      });

      if (emailExists) {
        throw new AppError("email already in use", 409);
      }
    }
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }

    const savedUser = await user.save();

    const userObj = savedUser.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    sendSuccess(
      res,
      { ...userWithoutPassword, _id: req.userId },
      "profile updated successfully",
    );
  },
);
