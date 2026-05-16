import express from "express";
import healthRoute from "./routes/healthRoutes.js";
import assignmentRoute from "./routes/assignmentRoutes.js";
import classroomRoute from "./routes/classroomRoutes.js";
import { env } from "../config/env.js";
import { logger } from "../core/logger.js";

export function createServer() {
  const app = express();

  app.use(express.json());

  // Routes
  app.use("/health", healthRoute);
  app.use("/assignments", assignmentRoute);
  app.use("/auth/google", classroomRoute);

  return app;
}

export function startServer() {
  const app = createServer();
  const port = env.API_PORT;

  return app.listen(port, "127.0.0.1", () => {
    logger.info(`API Server running on http://127.0.0.1:${port}`);
  });
}
