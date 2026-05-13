import {
  formatAssignmentsMessage,
  formatSyncTime,
} from "../services/formatter-service.js";
import {
  fetchClassroomPendingAssignments,
  fetchPendingAssignments,
  syncClassroomAssignments,
} from "../services/assignment-api-client.js";
import {
  loadReminderConfig,
  saveReminderConfig,
} from "../services/reminder-config-service.js";

export async function handleCommand(rawText: string, remoteJid: string): Promise<string | null> {
  const text = rawText.trim().toLowerCase();

  // Normalisasi command: hilangkan slash di awal jika ada, gunakan seluruh teks
  const command = text.startsWith("/") ? text.slice(1) : text;

  switch (command) {
    case "ping":
      return "pong";
    case "help":
      return [
        "Daftar command:",
        "- ping",
        "- help",
        "- tugas",
        "- tugas classroom",
        "- sync classroom",
        "- hubungkan classroom",
        "- aktifkan reminder",
        "- matikan reminder",
        "- status reminder",
      ].join("\n");
    case "hubungkan classroom": {
      const publicUrl = process.env.APP_PUBLIC_URL ?? "http://127.0.0.1:3007";
      return [
        "Silakan hubungkan Google Classroom lewat link ini:",
        `${publicUrl}/auth/google`,
      ].join("\n");
    }
    case "tugas": {
      try {
        const pendingAssignments = await fetchPendingAssignments();
        return formatAssignmentsMessage(pendingAssignments);
      } catch (error) {
        if (error instanceof Error && error.message.includes("is not an array")) {
          return "Maaf, format data tugas belum sesuai.";
        }
        return "Maaf, data tugas belum bisa diambil. Coba lagi sebentar lagi.";
      }
    }
    case "tugas classroom": {
      try {
        const pendingAssignments = await fetchClassroomPendingAssignments();
        if (pendingAssignments.length === 0) {
          return "Belum ada tugas Classroom yang tercatat belum selesai.";
        }
        return formatAssignmentsMessage(pendingAssignments);
      } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
          return "Classroom belum terhubung. Ketik: hubungkan classroom";
        }
        if (error instanceof Error && error.message.includes("status 409")) {
          return "Data Classroom belum disinkronkan. Ketik: sync classroom";
        }
        if (error instanceof Error && error.message.includes("is not an array")) {
          return "Maaf, format data tugas Classroom belum sesuai.";
        }
        return "Maaf, tugas Classroom belum bisa diambil. Coba lagi sebentar lagi.";
      }
    }
    case "sync classroom": {
      try {
        const result = await syncClassroomAssignments();
        return [
          "Sinkronisasi Classroom selesai.",
          `Jumlah tugas belum selesai: ${result.count}`,
          `Waktu sinkron: ${formatSyncTime(result.syncedAt)}`,
        ].join("\n");
      } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
          return "Classroom belum terhubung. Ketik: hubungkan classroom";
        }
        return "Maaf, sinkronisasi Classroom gagal. Coba lagi sebentar lagi.";
      }
    }
    case "aktifkan reminder": {
      await saveReminderConfig({
        enabled: true,
        chatJid: remoteJid,
      });
      return [
        "Reminder harian aktif.",
        "Aku akan mengingatkan tugas yang belum selesai setiap hari jam 17.00 WIB.",
      ].join("\n");
    }
    case "matikan reminder": {
      await saveReminderConfig({ enabled: false });
      return "Reminder harian dimatikan.";
    }
    case "status reminder": {
      const config = await loadReminderConfig();
      if (config.enabled) {
        return [
          "Reminder aktif.",
          `Jam reminder: ${config.reminderTime} WIB`,
          `Auto sync: ${config.autoSyncTime} WIB`,
        ].join("\n");
      }
      return "Reminder belum aktif. Ketik: aktifkan reminder";
    }
    default:
      return null;
  }
}
