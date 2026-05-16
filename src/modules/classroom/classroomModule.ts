import { registerRoute } from "../whatsapp/routeRegistry.js";
import { classroomMessageHandler } from "./classroomMessageHandler.js";
import { MessageContext } from "../../infra/whatsapp/whatsappTypes.js";
import { getGoogleOAuth2Client } from "../../infra/google/googleClient.js";
import { logger } from "../../core/logger.js";
import { registerTaskProvider } from "../tasks/taskService.js";
import { ClassroomTaskProvider } from "./classroomService.js";

export function initClassroomModule() {
  if (!getGoogleOAuth2Client()) {
    logger.warn("Classroom module is disabled due to missing Google credentials.");
    return;
  }

  // Register task provider
  registerTaskProvider(new ClassroomTaskProvider());

  // Register routes
  registerRoute({
    name: "classroom",
    priority: 40,
    canHandle: (ctx: MessageContext) => {
      const text = ctx.normalizedText;
      return text === "hubungkan classroom" || 
             text === "tugas classroom" || 
             text === "sync classroom";
    },
    handle: classroomMessageHandler
  });

  logger.info("Classroom module initialized.");
}
