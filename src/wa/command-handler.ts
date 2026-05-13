import { formatAssignmentsMessage } from "../services/formatter-service.js";
import { fetchPendingAssignments } from "../services/assignment-api-client.js";

export async function handleCommand(rawText: string): Promise<string | null> {
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
        "- hubungkan classroom",
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
    default:
      return null;
  }
}
