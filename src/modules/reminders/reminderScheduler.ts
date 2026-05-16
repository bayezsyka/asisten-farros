import cron from "node-cron";
import { loadReminderConfig } from "./reminderService.js";
import { sendMessage } from "../../infra/whatsapp/sendMessage.js";
import { syncAllTasks, formatAssignmentsText } from "../tasks/taskService.js";
import { getCachedTasks, isCacheFresh } from "../tasks/taskCacheService.js";
import { logger } from "../../core/logger.js";
import { env } from "../../config/env.js";

// Keep track of tasks so we don't duplicate crons on reconnects
let schedulerInitialized = false;

export function initReminderScheduler() {
  if (schedulerInitialized) return;
  schedulerInitialized = true;

  // 1. Auto-sync job at 16:55
  cron.schedule(
    "55 16 * * *",
    async () => {
      try {
        logger.info("[Scheduler] Menjalankan auto-sync Classroom...");
        const cache = await syncAllTasks();
        logger.info(`[Scheduler] Auto-sync Classroom selesai. Cache tersimpan dengan ${cache.items.length} tugas.`);
      } catch (error) {
        logger.error({ err: error }, "[Scheduler] Auto-sync gagal");
      }
    },
    {
      timezone: env.TZ,
    }
  );

  // 2. Reminder job at 17:00
  cron.schedule(
    "0 17 * * *",
    async () => {
      try {
        const config = await loadReminderConfig();
        if (!config.enabled || !config.chatJid) {
          return;
        }

        logger.info("Menjalankan reminder harian...");
        
        let cache = await getCachedTasks();
        
        // If somehow cache is totally empty, we can try to fetch just in case, but usually we just skip or complain.
        // Let's try to sync if null
        if (!cache) {
          logger.info("[Scheduler] Cache kosong, mencoba sync...");
          try {
            cache = await syncAllTasks();
          } catch (e) {
            logger.error("[Scheduler] Gagal sync saat reminder, mengirim peringatan.");
            await sendMessage(config.chatJid, { text: "Gagal mengirim reminder: Data tugas belum tersedia dan auto-sync gagal." });
            return;
          }
        }
        
        let message = "";
        
        if (cache.items.length === 0) {
          message = "Aman. Tidak ada tugas yang tercatat belum selesai.";
        } else {
          const isFresh = isCacheFresh(cache);
          const formattedTasks = formatAssignmentsText(cache, !isFresh);
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
