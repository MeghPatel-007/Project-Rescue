import { Schema, model, models } from "mongoose";
import type { IUser } from "../types/user.type";

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    age: {
      type: Number,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const User = models.User ?? model<IUser>("User", userSchema);