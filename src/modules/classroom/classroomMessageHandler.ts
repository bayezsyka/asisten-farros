import { MessageContext, RouteResult } from "../../infra/whatsapp/whatsappTypes.js";
import { getAuthUrl } from "./classroomAuthService.js";
import { syncAllTasks, formatAssignmentsText } from "../tasks/taskService.js";
import { getCachedTasks, isCacheFresh } from "../tasks/taskCacheService.js";

export async function classroomMessageHandler(ctx: MessageContext): Promise<RouteResult> {
  const text = ctx.normalizedText;

  if (text === "hubungkan classroom") {
    const url = getAuthUrl();
    if (!url) {
      return { handled: true, reply: "Classroom module is disabled (credentials missing)." };
    }
    return { 
      handled: true, 
      reply: `Silakan klik link berikut untuk menghubungkan Google Classroom:\n${url}`
    };
  }

  if (text === "sync classroom") {
    try {
      const cache = await syncAllTasks();
      const dateStr = new Date(cache.syncedAt).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      });
      const timeStr = new Date(cache.syncedAt).toLocaleTimeString("id-ID", {
        hour: "2-digit", minute: "2-digit"
      });

      const reply = `Sinkronisasi Classroom selesai.\nJumlah tugas belum selesai: ${cache.items.length}\nWaktu sinkron: ${dateStr} ${timeStr} WIB\n\nKetik 'tugas classroom' atau 'tugas' untuk melihat daftar.`;
      
      return { handled: true, reply };
    } catch (error: any) {
      if (error.message === "UNAUTHORIZED" || String(error.message).includes("invalid_grant")) {
        return { handled: true, reply: "Akses Google Classroom perlu dihubungkan ulang. Ketik 'hubungkan classroom'." };
      }
      return { handled: true, reply: "Sinkronisasi gagal karena koneksi ke Google bermasalah. Coba lagi sebentar lagi." };
    }
  }

  if (text === "tugas classroom") {
    try {
      const cache = await getCachedTasks();
      if (!cache) {
        return { handled: true, reply: "Data tugas belum tersedia. Ketik 'sync classroom' untuk menyinkronkan." };
      }

      const isFresh = isCacheFresh(cache);
      const replyText = formatAssignmentsText(cache, !isFresh);
      return { handled: true, reply: replyText };
    } catch (error: any) {
      return { handled: true, reply: "Gagal mengambil daftar tugas dari cache." };
    }
  }

  return { handled: false };
}
