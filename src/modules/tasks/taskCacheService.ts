import { promises as fs } from "fs";
import path from "path";
import { Assignment, TaskCache } from "./taskTypes.js";
import { env } from "../../config/env.js";

const CACHE_DIR = path.join(process.cwd(), ".data", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "tasks-cache.json");

let memoryCache: TaskCache | null = null;

export async function getCachedTasks(): Promise<TaskCache | null> {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    const parsed = JSON.parse(data) as TaskCache;
    memoryCache = parsed;
    return parsed;
  } catch (error) {
    return null;
  }
}

export async function saveTasksCache(items: Assignment[], source: string = "mixed"): Promise<TaskCache> {
  const cache: TaskCache = {
    items,
    syncedAt: new Date().toISOString(),
    source,
    owner: "farros"
  };

  memoryCache = cache;

  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write tasks cache to disk", error);
  }

  return cache;
}

export function isCacheFresh(cache: TaskCache): boolean {
  if (!cache || !cache.syncedAt) return false;
  
  const syncedDate = new Date(cache.syncedAt);
  const now = new Date();
  
  const diffMinutes = (now.getTime() - syncedDate.getTime()) / (1000 * 60);
  
  return diffMinutes < env.TASK_CACHE_TTL_MINUTES;
}
