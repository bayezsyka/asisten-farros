import cron from "node-cron";
import { loadReminderConfig } from "./reminderService.js";
import { sendMessage } from "../../infra/whatsapp/sendMessage.js";
import { getAllPendingTasks, formatAssignmentsText } from "../tasks/taskService.js";
import { logger } from "../../core/logger.js";
import { env } from "../../config/env.js";

// Keep track of tasks so we don't duplicate crons on reconnects
let schedulerInitialized = false;

export function initReminderScheduler() {
  if (schedulerInitialized) return;
  schedulerInitialized = true;

  // Sync not directly implemented here because `getAllPendingTasks` fetches real-time anyway. 
  // However, we can keep the 17.00 reminder logic and it will fetch fresh tasks.

  cron.schedule(
    "0 17 * * *",
    async () => {
      try {
        const config = await loadReminderConfig();
        if (!config.enabled || !config.chatJid) {
          return;
        }

        logger.info("Menjalankan reminder harian...");
        
        const tasks = await getAllPendingTasks();
        let message = "";
        
        if (tasks.length === 0) {
          message = "Aman. Tidak ada tugas yang tercatat belum selesai.";
        } else {
          const formattedTasks = formatAssignmentsText(tasks);
          message = ["*Pengingat Tugas Jam 17.00*", "", formattedTasks].join("\n");
        }

        await sendMessage(config.chatJid, { text: message });
        logger.info({ jid: config.chatJid }, "Reminder harian terkirim.");
      } catch (error) {
        logger.error({ err: error }, "Reminder harian gagal");
      }
    },
    {
      timezone: env.TZ,
    },
  );
  
  logger.info("Reminder scheduler initialized.");
}
