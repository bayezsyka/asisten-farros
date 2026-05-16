import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCachedTasks, saveTasksCache, isCacheFresh } from "../src/modules/tasks/taskCacheService.js";
import { syncAllTasks } from "../src/modules/tasks/taskService.js";
import { classroomMessageHandler } from "../src/modules/classroom/classroomMessageHandler.js";
import { taskMessageHandler } from "../src/modules/tasks/taskMessageHandler.js";
import { env } from "../src/config/env.js";

// Mock FS so we don't actually write to disk during tests
vi.mock("fs", () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  }
}));

// Mock taskService so we can simulate fetch success/failure
vi.mock("../src/modules/tasks/taskService.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    syncAllTasks: vi.fn(),
  };
});

// Mock config/env to ensure predictable TTL
vi.mock("../../config/env.js", () => ({
  env: {
    TASK_CACHE_TTL_MINUTES: 360
  }
}));

describe("Task Cache System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset internal memory cache between tests indirectly by just writing to it
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("1. save cache lalu get cache", async () => {
    const items = [{ id: "1", title: "Test", courseName: "Test", provider: "manual", status: "pending", isPending: true, dueAt: null }] as any;
    const cache = await saveTasksCache(items, "mixed");
    
    expect(cache.items).toHaveLength(1);
    expect(cache.items[0].title).toBe("Test");

    const retrieved = await getCachedTasks();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.items[0].title).toBe("Test");
  });

  it("2. cache fresh jika syncedAt masih muda", async () => {
    const cache = {
      items: [],
      source: "mixed",
      syncedAt: new Date().toISOString() // Right now
    };
    
    // We override the env in the test env but since `env` is imported inside `taskCacheService`, 
    // it will use the default or the one defined in the process. We forced 360 in env.ts.
    env.TASK_CACHE_TTL_MINUTES = 360;
    
    expect(isCacheFresh(cache)).toBe(true);
  });

  it("3. cache stale jika syncedAt melewati TTL", async () => {
    const oldDate = new Date();
    oldDate.setMinutes(oldDate.getMinutes() - 400); // 400 minutes ago, TTL is 360

    const cache = {
      items: [],
      source: "mixed",
      syncedAt: oldDate.toISOString()
    };
    
    expect(isCacheFresh(cache)).toBe(false);
  });

  it("4. command sync classroom memanggil fetch Google dan menyimpan cache", async () => {
    const mockSync = vi.mocked(syncAllTasks);
    mockSync.mockResolvedValueOnce({
      items: [],
      source: "mixed",
      syncedAt: new Date().toISOString()
    });

    const ctx = {
      normalizedText: "sync classroom",
      remoteJid: "123",
      senderJid: "123",
      text: "sync classroom",
      fromMe: false,
      isGroup: false,
      timestamp: new Date(),
      rawMessage: {} as any
    };

    const result = await classroomMessageHandler(ctx);
    
    expect(result.handled).toBe(true);
    expect(result.reply).toContain("Sinkronisasi Classroom selesai");
    expect(mockSync).toHaveBeenCalledTimes(1);
  });

  it("5. command tugas classroom membaca cache, tidak memanggil fetch Google", async () => {
    const mockSync = vi.mocked(syncAllTasks);
    // Ensure we have some cache
    await saveTasksCache([], "mixed");

    const ctx = {
      normalizedText: "tugas classroom",
      remoteJid: "123",
      senderJid: "123",
      text: "tugas classroom",
      fromMe: false,
      isGroup: false,
      timestamp: new Date(),
      rawMessage: {} as any
    };

    const result = await classroomMessageHandler(ctx);
    
    expect(result.handled).toBe(true);
    expect(result.reply).toContain("tidak ada tugas"); // because empty array
    expect(mockSync).not.toHaveBeenCalled(); // Should NOT call syncAllTasks
  });

  it("6. command tugas membaca cache, tidak memanggil fetch Google", async () => {
    const mockSync = vi.mocked(syncAllTasks);
    await saveTasksCache([], "mixed");

    const ctx = {
      normalizedText: "tugas",
      remoteJid: "123",
      senderJid: "123",
      text: "tugas",
      fromMe: false,
      isGroup: false,
      timestamp: new Date(),
      rawMessage: {} as any
    };

    const result = await taskMessageHandler(ctx);
    
    expect(result.handled).toBe(true);
    expect(result.reply).toContain("tidak ada tugas");
    expect(mockSync).not.toHaveBeenCalled();
  });

  it("8. jika sync gagal, cache lama tetap ada", async () => {
    // Save old cache
    const oldDate = new Date();
    oldDate.setMinutes(oldDate.getMinutes() - 100);
    await saveTasksCache([{ id: "1", title: "Old Task", courseName: "Old", provider: "manual", status: "pending", isPending: true, dueAt: null } as any], "mixed");
    
    // Check old cache exists
    let cache = await getCachedTasks();
    expect(cache?.items[0].title).toBe("Old Task");

    // Mock sync failure
    const mockSync = vi.mocked(syncAllTasks);
    mockSync.mockRejectedValueOnce(new Error("Connection error"));

    const ctx = {
      normalizedText: "sync classroom",
      remoteJid: "123",
      senderJid: "123",
      text: "sync classroom",
      fromMe: false,
      isGroup: false,
      timestamp: new Date(),
      rawMessage: {} as any
    };

    const result = await classroomMessageHandler(ctx);
    expect(result.handled).toBe(true);
    expect(result.reply).toContain("Sinkronisasi gagal");

    // Cache should remain the same
    cache = await getCachedTasks();
    expect(cache?.items[0].title).toBe("Old Task");
  });
});
