import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./db.js";
import apiRouter from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json({ limit: "1mb" }));

app.use("/api", apiRouter);

const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const port = process.env.PORT || 3000;
connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });
