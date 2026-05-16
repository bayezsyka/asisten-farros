import { MessageContext, RouteResult } from "../../infra/whatsapp/whatsappTypes.js";
import { formatAssignmentsText } from "./taskService.js";
import { getCachedTasks, isCacheFresh } from "./taskCacheService.js";

export async function taskMessageHandler(ctx: MessageContext): Promise<RouteResult> {
  const text = ctx.normalizedText;

  if (text === "tugas") {
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
