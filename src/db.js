import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/equans_timesheet";

export async function connectDb() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGODB_URI, {
    autoIndex: true
  });
}
