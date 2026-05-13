import { promises as fs } from "fs";
import path from "path";
import type { Assignment } from "../types/assignment.js";

const CACHE_PATH = path.join(process.cwd(), "data", "classroom-assignments-cache.json");

export type ClassroomCache = {
  syncedAt: string;
  assignments: Assignment[];
};

export async function saveClassroomCache(assignments: Assignment[]): Promise<ClassroomCache> {
  const cache: ClassroomCache = {
    syncedAt: new Date().toISOString(),
    assignments,
  };

  await fs.mkdir(path.dirname(CACHE_PATH), { recursive: true });
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");

  return cache;
}

export async function loadClassroomCache(): Promise<ClassroomCache | null> {
  try {
    const content = await fs.readFile(CACHE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}
