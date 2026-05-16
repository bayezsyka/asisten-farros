import { Assignment, TaskProvider, TaskCache } from "./taskTypes.js";
import { saveTasksCache } from "./taskCacheService.js";
import { formatTaskDueAt } from "../../core/date.js";

const providers: TaskProvider[] = [];

export function registerTaskProvider(provider: TaskProvider) {
  providers.push(provider);
}

export async function syncAllTasks(): Promise<TaskCache> {
  let allTasks: Assignment[] = [];
  
  for (const provider of providers) {
    try {
      const tasks = await provider.getPendingTasks();
      allTasks = allTasks.concat(tasks);
    } catch (error: any) {
      if (error.message !== "UNAUTHORIZED") {
        console.error(`Error fetching tasks from ${provider.name}:`, error);
      }
      // If unauthorized, we might still want to return other providers' tasks, but throw if it's the only one
      // For now, let it pass so it doesn't break other providers if one fails
      if (error.message === "UNAUTHORIZED" && providers.length === 1) {
        throw error;
      }
    }
  }

  const sorted = sortPendingAssignments(allTasks);
  return await saveTasksCache(sorted, "mixed");
}

export function sortPendingAssignments(assignments: Assignment[]): Assignment[] {
  return assignments.sort((a, b) => {
    if (!a.dueAt && !b.dueAt) return 0;
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;

    const dateA = new Date(a.dueAt);
    const dateB = new Date(b.dueAt);
    return dateA.getTime() - dateB.getTime();
  });
}

export function formatAssignmentsText(cache: TaskCache, isStale: boolean = false): string {
  const assignments = cache.items;
  
  if (assignments.length === 0) {
    return "✅ Asik, tidak ada tugas yang belum dikerjakan!";
  }

  let text = `📚 *Daftar Tugas Pending (${assignments.length})*\n\n`;

  assignments.forEach((a, i) => {
    let dueStr = formatTaskDueAt(a.dueAt, a.hasTime ?? true);
    
    if (a.dueAt) {
      const date = new Date(a.dueAt);
      const isPast = date < new Date();
      if (isPast) {
        dueStr = `⚠️ *TERLAMBAT* (${dueStr})`;
      }
    }

    text += `${i + 1}. *${a.courseName}*\n`;
    text += `   📝 ${a.title}\n`;
    text += `   ⏰ ${dueStr}\n`;
    text += `   📌 Status: ${a.status}\n`;
    if (a.link) {
      text += `   🔗 Link: ${a.link}\n`;
    }
    text += "\n";
  });

  const syncedDate = new Date(cache.syncedAt);
  const formattedSync = syncedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }) + ", " + syncedDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

  text += `\n_Terakhir sinkron: ${formattedSync}_`;
  if (isStale) {
    text += `. _Ketik sync classroom untuk memperbarui._`;
  }

  return text.trim();
}
