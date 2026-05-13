import type { Assignment } from "../types/assignment.js";

const DUMMY_ASSIGNMENTS: Assignment[] = [
  {
    id: "gc-001",
    provider: "google_classroom",
    courseName: "Pemrograman Web",
    title: "Tugas React Router",
    dueAt: "2026-05-20T23:59:00+07:00",
    status: "belum dikumpulkan",
    isPending: true,
    link: "https://classroom.google.com/",
  },
  {
    id: "mt-001",
    provider: "microsoft_teams",
    courseName: "Sistem Operasi",
    title: "Resume Manajemen Memori",
    dueAt: "2026-05-22T23:59:00+07:00",
    status: "masih dikerjakan",
    isPending: true,
    link: "https://teams.microsoft.com/",
  },
  {
    id: "gc-002",
    provider: "google_classroom",
    courseName: "Basis Data",
    title: "Normalisasi",
    dueAt: null,
    status: "belum dikumpulkan",
    isPending: true,
  },
  {
    id: "mt-002",
    provider: "microsoft_teams",
    courseName: "Jaringan Komputer",
    title: "Analisis Topologi",
    dueAt: "2026-05-18T23:59:00+07:00",
    status: "sudah dikumpulkan",
    isPending: false,
  },
];

export async function getDummyAssignments(): Promise<Assignment[]> {
  return DUMMY_ASSIGNMENTS.map((assignment) => ({ ...assignment }));
}
