import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";
const MONGODB_URI =
  (env === "production" ? process.env.MONGODB_URI_PROD : process.env.MONGODB_URI_DEV) ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/equans_timesheet";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGODB_URI, {
    autoIndex: true
  });
}
