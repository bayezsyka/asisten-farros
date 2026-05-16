import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: {
    target: "pino/file",
    options: { destination: 1 }, // 1 is stdout
  },
});
