import type { ApiResponse, AuthResponse, User } from "../types/index.js";
import type { NextFunction, Request, Response } from "express";
import { asyncHandler, sendSuccess } from "../utils/responseHelpers.js";
import { AppError } from "../middleware/errorHandler.js";
import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/tokenHelpers.js";

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

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      name,
      email,
      password: hashPassword,
    });

    const savedUser = await newUser.save();

    const savedUserObj = savedUser.toObject();

    const { password: _, ...userWithoutPassword } = savedUserObj;

    const token = generateToken(savedUserObj._id.toString());

    const authResponse: AuthResponse = {
      user: { ...userWithoutPassword, _id: savedUserObj._id.toString() },
      token,
    };

    sendSuccess(res, authResponse, "user signed up successfully", 201);
  },
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user) {
      throw new AppError("invalid email or password", 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError("invalid email or password", 401);
    }

    const userObj = user.toObject();

    const { password: _, ...userWithoutPassword } = userObj;

    const token = generateToken(userObj._id.toString());

    const authResponse: AuthResponse = {
      user: { ...userWithoutPassword, _id: userObj._id.toString() },
      token,
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

export const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;

    const user = await UserModel.findById(req.userId);

    if (!user) {
      throw new AppError("user not found", 404);
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new AppError("old password is invalid", 403);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    await user.save();

    sendSuccess(res, null, "password updated successfully");
  },
);
