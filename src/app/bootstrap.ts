import { env } from "../config/env.js";
import { logger } from "../core/logger.js";
import { createBaileysClient, setIncomingMessageRouter } from "../infra/whatsapp/baileysClient.js";
import { startServer } from "../api/server.js";
import { routeIncomingMessage } from "../modules/whatsapp/messageRouter.js";

// Module initializers
import { initCommandModule } from "../modules/commands/commandModule.js";
import { initFinanceModule } from "../modules/finance/financeModule.js";
import { initClassroomModule } from "../modules/classroom/classroomModule.js";
import { initTaskModule } from "../modules/tasks/taskModule.js";
import { initReminderModule } from "../modules/reminders/reminderModule.js";

export async function bootstrap() {
  logger.info("Starting Asisten Farros...");

  // 1. Inisialisasi API Server
  startServer();

  // 2. Registrasi Module & Routes
  initCommandModule();
  initFinanceModule();
  initClassroomModule();
  initTaskModule();
  initReminderModule();

  // 3. Set Router WA
  setIncomingMessageRouter(routeIncomingMessage);

  // 4. Inisialisasi WhatsApp Client
  try {
    await createBaileysClient();
  } catch (error) {
    logger.error({ err: error }, "Gagal menghubungkan bot WhatsApp Baileys.");
    process.exit(1);
  }

  logger.info("Bootstrap complete.");
}
