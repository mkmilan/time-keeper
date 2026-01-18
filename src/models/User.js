import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    sapNumber: { type: String, required: true, trim: true },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.index({ fullName: 1 });
userSchema.index({ sapNumber: 1 });

export const User = mongoose.model("User", userSchema);
