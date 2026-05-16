import { MessageContext, RouteResult } from "../../infra/whatsapp/whatsappTypes.js";
import { getAllPendingTasks, formatAssignmentsText } from "./taskService.js";

export async function taskMessageHandler(ctx: MessageContext): Promise<RouteResult> {
  const text = ctx.normalizedText;

  if (text === "tugas") {
    try {
      const assignments = await getAllPendingTasks();
      const replyText = formatAssignmentsText(assignments);
      return { handled: true, reply: replyText };
    } catch (error: any) {
      if (error.message === "UNAUTHORIZED") {
        return { handled: true, reply: "Google Classroom belum dihubungkan. Ketik 'hubungkan classroom' untuk menghubungkan akun Google." };
      }
      return { handled: true, reply: "Gagal mengambil daftar tugas." };
    }
  }

  return { handled: false };
}
