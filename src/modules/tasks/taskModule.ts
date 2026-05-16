import { registerRoute } from "../whatsapp/routeRegistry.js";
import { taskMessageHandler } from "./taskMessageHandler.js";
import { MessageContext } from "../../infra/whatsapp/whatsappTypes.js";
import { logger } from "../../core/logger.js";

export function initTaskModule() {
  registerRoute({
    name: "tasks",
    priority: 50,
    canHandle: (ctx: MessageContext) => ctx.normalizedText === "tugas",
    handle: taskMessageHandler
  });

  logger.info("Task module initialized.");
}
