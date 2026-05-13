import "dotenv/config";

import { createBaileysClient } from "./wa/baileys-client.js";
import { startServer } from "./api/server.js";
import { initScheduler } from "./services/reminder-scheduler-service.js";

async function main(): Promise<void> {
  // Inisialisasi scheduler (auto sync & reminder)
  initScheduler();

  // Jalankan bot Baileys
  await createBaileysClient({
    authDir: process.env.BAILEYS_AUTH_DIR ?? ".baileys_auth",
    botName: process.env.WHATSAPP_BOT_NAME ?? "Laras Tugas",
    logLevel: process.env.LOG_LEVEL ?? "info",
  });

  // Jalankan API Server
  const apiPort = parseInt(process.env.ASISTEN_FARROS_API_PORT ?? "3007", 10);
  startServer(apiPort);
}

main().catch((error) => {
  console.error("Gagal menjalankan bot atau API:", error);
  process.exit(1);
});
