import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import itemRoutes from "./routes/items";
import matchRoutes from "./routes/matches";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/items", matchRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Lost and Found API is running" });
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Lost and Found API" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});