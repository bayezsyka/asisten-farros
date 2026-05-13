import express from "express";
import healthRoute from "./routes/health-route.js";
import assignmentRoute from "./routes/assignment-route.js";
import authGoogleRoute from "./routes/auth-google-route.js";

export function createServer() {
  const app = express();

  app.use(express.json());

  // Routes
  app.use("/health", healthRoute);
  app.use("/assignments", assignmentRoute);
  app.use("/auth/google", authGoogleRoute);

  return app;
}

export function startServer(port: number) {
  const app = createServer();

  return app.listen(port, "127.0.0.1", () => {
    console.log(`API Asisten Farros hidup di http://127.0.0.1:${port}`);
  });
}
