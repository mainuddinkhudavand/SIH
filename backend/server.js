import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // ✅ Load .env first
console.log("Loaded ENV:", process.env.SMTP_HOST, process.env.SMTP_USER);

import mongoose from 'mongoose';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import userProfile from "./routes/userRoutes.js";
import complaintRoutes from "./routes/complaints.js";
import adminRoutes from "./routes/admin.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import workerRoutes from "./routes/workerRoutes.js"; // worker routes
import chatRoutes from "./routes/chat.js";
import managerRoutes from "./routes/managerRoutes.js";
import { runEscalationCheck } from "./utils/escalation.js";

const app = express();
connectDB();

app.use("/uploads", express.static("uploads"));

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/user", userProfile);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/manager", managerRoutes);

// Chatbot API
app.use("/api/chat", chatRoutes);

// Root Status Check Route
app.get("/", (req, res) => {
  res.json({ message: "E-Gram Panchayat API is running..." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Run escalation check immediately and then every 1 minute
  runEscalationCheck();
  setInterval(runEscalationCheck, 60000);
});

export default app;

