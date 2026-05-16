import { registerRoute } from "../whatsapp/routeRegistry.js";
import { MessageContext } from "../../infra/whatsapp/whatsappTypes.js";
import { env } from "../../config/env.js";

function getHelpText(): string {
  let text = `*Daftar Command Asisten Farros*\n\n`;
  text += `- ping: Cek status bot\n`;
  text += `- help / daftar command: Tampilkan pesan ini\n`;
  
  if (env.SUPABASE_URL) {
    text += `\n*Finance*\n`;
    text += `- (Kirim pesan seperti "beli kopi 15k" untuk mencatat pengeluaran)\n`;
  }
  
  if (env.GOOGLE_CLIENT_ID) {
    text += `\n*Classroom*\n`;
    text += `- hubungkan classroom: Link akun Google\n`;
    text += `- sync classroom: Sinkronisasi tugas sekarang\n`;
    text += `- tugas classroom: Lihat daftar tugas Classroom\n`;
  }
  
  text += `\n*Tugas Umum*\n`;
  text += `- tugas: Lihat semua tugas tertunda\n`;
  
  text += `\n*Reminder*\n`;
  text += `- aktifkan reminder: Nyalakan pengingat harian\n`;
  text += `- matikan reminder: Matikan pengingat harian\n`;
  text += `- status reminder: Cek status pengingat\n`;

  return text;
}

export function initCommandModule() {
  registerRoute({
    name: "ping",
    priority: 60, // Setelah fitur utama
    canHandle: (ctx: MessageContext) => ctx.normalizedText === "ping",
    handle: async () => {
      return { handled: true, reply: "pong" };
    }
  });

  registerRoute({
    name: "help",
    priority: 60,
    canHandle: (ctx: MessageContext) => 
      ctx.normalizedText === "help" || 
      ctx.normalizedText === "daftar command" ||
      ctx.normalizedText === "menu",
    handle: async () => {
      return { handled: true, reply: getHelpText() };
    }
  });
}
