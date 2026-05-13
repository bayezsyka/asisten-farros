import { formatAssignmentsMessage } from "../services/formatter-service.js";
import { fetchPendingAssignments } from "../services/assignment-api-client.js";

export async function handleCommand(rawText: string): Promise<string | null> {
  const text = rawText.trim().toLowerCase();
  const [rawCommand] = text.split(/\s+/);

  // Normalisasi command: hilangkan slash di awal jika ada
  const command = rawCommand.startsWith("/") ? rawCommand.slice(1) : rawCommand;

  switch (command) {
    case "ping":
      return "pong";
    case "help":
      return ["Daftar command:", "- ping", "- help", "- tugas"].join("\n");
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
