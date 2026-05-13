import cron from "node-cron";
import { loadReminderConfig } from "./reminder-config-service.js";
import { getWASocket } from "../wa/baileys-client.js";
import { getClassroomPendingAssignments } from "./classroom-assignment-service.js";
import { saveClassroomCache, loadClassroomCache } from "./classroom-cache-service.js";
import { formatAssignmentsMessage } from "./formatter-service.js";

export function initScheduler() {
  // 1. Auto sync Classroom: Setiap hari jam 16.55 WIB
  cron.schedule(
    "55 16 * * *",
    async () => {
      try {
        console.log("[Scheduler] Menjalankan auto sync Classroom...");
        const assignments = await getClassroomPendingAssignments();
        await saveClassroomCache(assignments);
        console.log(`[Scheduler] Auto sync Classroom selesai. Count: ${assignments.length}`);
      } catch (error) {
        console.error(
          "[Scheduler] Auto sync Classroom gagal:",
          error instanceof Error ? error.message : error,
        );
      }
    },
    {
      timezone: "Asia/Jakarta",
    },
  );

  // 2. Reminder tugas: Setiap hari jam 17.00 WIB
  cron.schedule(
    "0 17 * * *",
    async () => {
      try {
        const config = await loadReminderConfig();
        if (!config.enabled || !config.chatJid) {
          return;
        }

        console.log("[Scheduler] Menjalankan reminder harian...");
        const socket = getWASocket();
        if (!socket) {
          console.warn("[Scheduler] Socket tidak tersedia, melewati reminder.");
          return;
        }

        let cache = await loadClassroomCache();
        if (!cache) {
          console.log("[Scheduler] Cache kosong, mencoba sync sebelum reminder...");
          try {
            const assignments = await getClassroomPendingAssignments();
            cache = await saveClassroomCache(assignments);
          } catch (syncError) {
            console.error("[Scheduler] Gagal sync saat reminder:", syncError);
          }
        }

        const assignments = cache?.assignments ?? [];
        let message = "";
        if (assignments.length === 0) {
          message = "Aman. Tidak ada tugas Classroom yang tercatat belum selesai.";
        } else {
          const formattedTasks = formatAssignmentsMessage(assignments);
          message = ["Pengingat tugas jam 17.00", "", formattedTasks].join("\n");
        }

        await socket.sendMessage(config.chatJid, { text: message });
        console.log("[Scheduler] Reminder harian terkirim ke", config.chatJid);
      } catch (error) {
        console.error("[Scheduler] Reminder harian gagal:", error);
      }
    },
    {
      timezone: "Asia/Jakarta",
    },
  );
}
