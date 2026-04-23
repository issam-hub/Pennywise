import mongoose, { Mongoose, Schema } from "mongoose";
import type { IUser } from "../types/entities.js";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const UserModel = mongoose.model<IUser>("user", UserSchema);

export default UserModel;
