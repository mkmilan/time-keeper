import mongoose from "mongoose";

const imputationCodeSchema = new mongoose.Schema(
  {
    code3: { type: Number, required: true, unique: true },
    short: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const ImputationCode = mongoose.model("ImputationCode", imputationCodeSchema);
