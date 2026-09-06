import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from 'mongoose';
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { seedInitialData } from "./config/seedData.js";
import fs from "fs";

// API Gateway & Middleware Layer
import { responseHandler } from "./middleware/gateway.js";

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// 🌟 Core GovConnect Interoperability Platform Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import userProfile from "./routes/userRoutes.js";
import adminRoutes from "./routes/admin.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import sectorRoutes from "./routes/sectorRoutes.js";

import citizenRoutes from "./routes/citizenRoutes.js";
import officialRoutes from "./routes/officialRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import governanceRoutes from "./routes/governanceRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import interopRoutes from "./routes/interopRoutes.js";

// 🏛️ Dedicated Portals Routes
import municipalRoutes from "./routes/municipalRoutes.js";
import revenueRoutes from "./routes/revenueRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

// Chatbot API
import chatRoutes from "./routes/chat.js";

const app = express();

app.use("/uploads", express.static("uploads"));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ✅ API Gateway Middleware Layer
app.use(responseHandler);

// 🌐 GovConnect Interoperability Platform Core APIs
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/user", userProfile);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/sectors", sectorRoutes);

app.use("/api/citizen", citizenRoutes);
app.use("/api/official", officialRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/governance", governanceRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/interop", interopRoutes);

// 🏢 Dedicated Portal Endpoints (Municipal, Revenue, Health)
app.use("/api/municipal", municipalRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/health", healthRoutes);

// Chatbot API
app.use("/api/chat", chatRoutes);

// Root Status Check Route
app.get("/", (req, res) => {
  res.json({
    platform: "GovConnect Interoperability Platform",
    status: "ONLINE",
    pillars: [
      "1. Citizen Portal (React Web App)",
      "2. GovConnect Platform (API Gateway, SSO, Consent, Data Mapper, Workflow Engine, Event Manager, Audit Logs)",
      "3. Municipal Portal",
      "4. Revenue Portal",
      "5. Health Portal",
      "6. Admin Portal"
    ]
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Express Error Handler caught:", err);
  if (err.name === "MulterError" || err.message?.includes("image")) {
    return res.status(400).json({ message: err.message || "File upload error" });
  }
  return res.status(500).json({ message: err.message || "Internal Server Error" });
});

const DEFAULT_PORT = parseInt(process.env.PORT || "5000", 10);

const startServer = (portToTry) => {
  const server = app.listen(portToTry, () => {
    console.log(`🚀 GovConnect Interoperability Gateway active on http://localhost:${portToTry}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[PORT CONFLICT] Port ${portToTry} is occupied. Retrying on port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error("Backend Server Error:", err);
    }
  });
};

connectDB().then(async () => {
  await seedInitialData();
  startServer(DEFAULT_PORT);
  console.log(`
  ==============================================================
  🏛️  GovConnect Interoperability Platform Active
  ==============================================================
  🌐 Backend Gateway  : http://localhost:${DEFAULT_PORT}
  💻 Frontend App     : http://localhost:3000

  🔑 Demo Credentials:
     • State Admin   : admin@egram.com      / Admin@123
     • Demo Official : official@egram.gov.in / Official@123
     • Demo Citizen  : citizen@example.com  / Citizen@123
  ==============================================================
  `);
}).catch((err) => {
  console.error("Database connection initialization failed:", err);
});

export default app;
