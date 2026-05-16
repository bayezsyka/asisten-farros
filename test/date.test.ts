import { describe, it, expect } from "vitest";
import { buildUtcDateFromClassroomDue, formatTaskDueAt, formatDateTimeWib } from "../src/core/date.js";
import { env } from "../src/config/env.js";

// Force timezone in test to be deterministic
env.TZ = "Asia/Jakarta";

describe("Date Core Utils", () => {
  it("1. buildUtcDateFromClassroomDue with dueDate 2026-05-20 and dueTime 16:59 produces WIB 23.59", () => {
    const dueDate = { year: 2026, month: 5, day: 20 };
    const dueTime = { hours: 16, minutes: 59 };
    
    const date = buildUtcDateFromClassroomDue(dueDate, dueTime);
    expect(date).not.toBeNull();
    
    // Check if the UTC hours are correctly set to 16
    expect(date?.getUTCHours()).toBe(16);
    expect(date?.getUTCMinutes()).toBe(59);

    // Format should yield 23.59 WIB
    const formatted = formatDateTimeWib(date!);
    expect(formatted).toContain("23.59");
    expect(formatted).toContain("Rab, 20 Mei");
  });

  it("2. formatTaskDueAt produces expected format", () => {
    const date = new Date(Date.UTC(2026, 4, 20, 16, 59)); // 20 May 2026 16:59 UTC
    const formatted = formatTaskDueAt(date, true);
    expect(formatted).toContain("Rab, 20 Mei");
    expect(formatted).toContain("23.59");
    expect(formatted).not.toContain("pukul"); // Ensure "pukul" is stripped if exists
    expect(formatted).not.toContain(":"); // Ensure colon is replaced by dot
  });

  it("3. Jika dueTime kosong, tampilkan tanggal saja", () => {
    const date = new Date(Date.UTC(2026, 4, 20, 16, 59));
    const formatted = formatTaskDueAt(date, false);
    expect(formatted).toBe("Rab, 20 Mei");
  });

  it("4. Jika dueDate kosong, tampilkan 'belum ditentukan'", () => {
    expect(formatTaskDueAt(null)).toBe("belum ditentukan");
    expect(formatTaskDueAt("")).toBe("belum ditentukan");
  });
});
