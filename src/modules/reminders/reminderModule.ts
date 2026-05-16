import { registerRoute } from "../whatsapp/routeRegistry.js";
import { reminderMessageHandler } from "./reminderMessageHandler.js";
import { MessageContext } from "../../infra/whatsapp/whatsappTypes.js";
import { initReminderScheduler } from "./reminderScheduler.js";
import { logger } from "../../core/logger.js";

export function initReminderModule() {
  initReminderScheduler();

  registerRoute({
    name: "reminders",
    priority: 30, // Before general tasks and commands
    canHandle: (ctx: MessageContext) => {
      const text = ctx.normalizedText;
      return text === "aktifkan reminder" || 
             text === "matikan reminder" || 
             text === "status reminder";
    },
    handle: reminderMessageHandler
  });

  logger.info("Reminder module initialized.");
}
