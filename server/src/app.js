import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import workspaceRoutes from "./routes/workspaces.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(s => s.trim()) : "http://localhost:5173" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));
  app.get("/api/health", (req, res) => res.json({ status: "ok", service: "projectflow-api" }));
  app.use("/api/auth", authRoutes);
  app.use("/api/workspaces", workspaceRoutes);
  app.use("/api/projects", projectRoutes);
  app.use((req, res, next) => {
    if (req.method === "PATCH") {
      console.log("PATCH reached Express:", req.method, req.originalUrl);
    }
    next();
  });
  app.use("/api", taskRoutes);
  console.log("Task router mounted at /api");
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
