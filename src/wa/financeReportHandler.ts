import { getDailyReportForSender, broadcastDailyReportFromSender } from "../services/finance/reportService.js";
import { ReplyFn } from "./message-router.js";

export async function handleFinanceReport(text: string, remoteJid: string, reply: ReplyFn): Promise<string | null> {
  const normalizedText = text.toLowerCase().trim();

  if (normalizedText === "rekap hari ini" || normalizedText === "laporan hari ini") {
    const report = await getDailyReportForSender(remoteJid);
    if (!report) {
      return "Nomor ini tidak terhubung dengan workspace manapun sebagai pengirim.";
    }
    return report;
  }

  if (normalizedText === "kirim laporan" || normalizedText === "kirim rekap") {
    const result = await broadcastDailyReportFromSender(remoteJid);
    
    if (!result.success) {
      return result.message; // e.g. "Belum ada penerima laporan yang terhubung."
    }

    // Send to all targets
    for (const targetJid of result.targets) {
      try {
        await reply(targetJid, result.report);
      } catch (err) {
        console.error(`Failed to send report to ${targetJid}:`, err);
      }
    }

    return "Laporan sudah dikirim ke semua penerima yang terhubung.";
  }

  return null;
}
