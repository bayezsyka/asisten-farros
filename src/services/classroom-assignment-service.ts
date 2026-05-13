import { classroom_v1 } from "googleapis";
import { getGoogleClassroomClient } from "../connectors/google-classroom.js";
import type { Assignment } from "../types/assignment.js";
import { sortPendingAssignments } from "./formatter-service.js";

export async function getClassroomPendingAssignments(): Promise<Assignment[]> {
  const classroom = await getGoogleClassroomClient();
  if (!classroom) {
    throw new Error("UNAUTHORIZED");
  }

  // 1. Ambil daftar course yang aktif
  const coursesRes = await classroom.courses.list({
    courseStates: ["ACTIVE"],
  });

  const courses = coursesRes.data.courses ?? [];
  const allPending: Assignment[] = [];

  for (const course of courses) {
    if (!course.id || !course.name) continue;

    // 2. Ambil coursework setiap course
    const courseworkRes = await classroom.courses.courseWork.list({
      courseId: course.id,
    });

    const courseWorks = courseworkRes.data.courseWork ?? [];

    for (const cw of courseWorks) {
      if (!cw.id || !cw.title) continue;

      // 3. Ambil student submission milik user
      const submissionsRes = await classroom.courses.courseWork.studentSubmissions.list({
        courseId: course.id,
        courseWorkId: cw.id,
      });

      const submissions = submissionsRes.data.studentSubmissions ?? [];
      const mySubmission = submissions[0]; // Akun siswa biasanya hanya melihat miliknya sendiri

      let isEligible = false;
      let statusLabel = "belum diketahui";

      if (mySubmission) {
        const state = mySubmission.state;

        // Hanya status CREATED dan RECLAIMED_BY_STUDENT yang dianggap pending utama
        if (state === "CREATED" || state === "RECLAIMED_BY_STUDENT") {
          isEligible = true;
          statusLabel = "belum dikumpulkan";
        }
        // TURNED_IN dan RETURNED diabaikan (isEligible tetap false)
      } else {
        // Fallback jika student submission tidak ditemukan
        isEligible = true;
        statusLabel = "belum diketahui";
      }

      if (isEligible) {
        const dueAt = convertClassroomDateToISO(cw.dueDate, cw.dueTime);

        // Filter waktu: sembunyikan tugas yang sudah lewat lebih dari 60 hari
        if (dueAt) {
          const dueDate = new Date(dueAt);
          const now = new Date();
          const diffDays = (now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24);

          if (diffDays > 60) {
            isEligible = false;
          }
        }

        if (isEligible) {
          allPending.push({
            id: `gc-${cw.id}`,
            provider: "google_classroom",
            courseName: course.name,
            title: cw.title,
            dueAt,
            status: statusLabel,
            isPending: true,
            link: cw.alternateLink ?? undefined,
          });
        }
      }
    }
  }

  return sortPendingAssignments(allPending);
}

function convertClassroomDateToISO(
  date?: classroom_v1.Schema$Date,
  time?: classroom_v1.Schema$TimeOfDay,
): string | null {
  if (!date || !date.year || !date.month || !date.day) {
    return null;
  }

  const hours = time?.hours ?? 23;
  const minutes = time?.minutes ?? 59;

  // Menggunakan timezone lokal (WIB biasanya di server Farros)
  const d = new Date(date.year, date.month - 1, date.day, hours, minutes);
  return d.toISOString();
}
