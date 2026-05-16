import { MessageContext, RouteResult } from "../../infra/whatsapp/whatsappTypes.js";
import { getAuthUrl } from "./classroomAuthService.js";
import { ClassroomTaskProvider } from "./classroomService.js";
import { formatAssignmentsText } from "../tasks/taskService.js";

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

  if (text === "tugas classroom" || text === "sync classroom") {
    const provider = new ClassroomTaskProvider();
    try {
      const assignments = await provider.getPendingTasks();
      const replyText = formatAssignmentsText(assignments);
      return { handled: true, reply: replyText };
    } catch (error: any) {
      if (error.message === "UNAUTHORIZED" || error.message.includes("invalid_grant")) {
        return { handled: true, reply: "Sesi Google Classroom tidak valid. Silakan ketik 'hubungkan classroom' untuk mengautentikasi ulang." };
      }
      return { handled: true, reply: "Gagal menyinkronkan tugas Classroom." };
    }
  }

  return { handled: false };
}
