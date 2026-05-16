import { env } from "../config/env.js";

type ClassroomDate = {
  year?: number | null;
  month?: number | null;
  day?: number | null;
};

type ClassroomTime = {
  hours?: number | null;
  minutes?: number | null;
  seconds?: number | null;
};

export function buildUtcDateFromClassroomDue(
  dueDate?: ClassroomDate,
  dueTime?: ClassroomTime
): Date | null {
  if (!dueDate || !dueDate.year || !dueDate.month || !dueDate.day) {
    return null;
  }

  // Google Classroom returns dueDate and dueTime in UTC.
  // If dueTime is missing, it usually means the end of the day in local time of the user,
  // but to be safe and timezone-independent without knowing the user's specific end of day,
  // we will map it to 23:59:59 UTC, or we can use 16:59:59 UTC (23:59 WIB). 
  // Wait, let's just use 16:59:59 UTC if it's missing, so it aligns with 23:59 WIB.
  // Actually, if we just parse exactly what's given:
  const hours = dueTime?.hours ?? 16;   // 16 UTC is 23 WIB
  const minutes = dueTime?.minutes ?? 59;
  const seconds = dueTime?.seconds ?? 59;

  return new Date(Date.UTC(dueDate.year, dueDate.month - 1, dueDate.day, hours, minutes, seconds));
}

export function formatDateTimeWib(date: Date): string {
  // Format to "Rab, 20 Mei, 23.59"
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone: env.TZ || "Asia/Jakarta",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Example output: "Rab, 20 Mei, 23.59"
  // Note: Node's Intl.DateTimeFormat for id-ID uses '.' for time separator (23.59)
  // But some versions might use ':'. We can explicitly replace ':' with '.' if needed.
  let formatted = formatter.format(date);
  
  // Clean up "pukul" if it appears (Node 18+ id-ID might include "pukul")
  formatted = formatted.replace(" pukul ", ", ");
  
  // Ensure the time uses dot instead of colon
  formatted = formatted.replace(/:/g, ".");
  
  return formatted;
}

export function formatTaskDueAt(dueAt: string | Date | null, hasTime: boolean = true): string {
  if (!dueAt) {
    return "belum ditentukan";
  }

  const date = typeof dueAt === "string" ? new Date(dueAt) : dueAt;
  
  if (!hasTime) {
    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: env.TZ || "Asia/Jakarta",
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    return formatter.format(date);
  }

  return formatDateTimeWib(date);
}
