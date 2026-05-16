import { Assignment, TaskProvider } from "../tasks/taskTypes.js";
import { getAuthorizedClassroomClient } from "./classroomAuthService.js";
import { classroom_v1 } from "googleapis";

export class ClassroomTaskProvider implements TaskProvider {
  name = "google_classroom";

  async getPendingTasks(): Promise<Assignment[]> {
    const classroom = await getAuthorizedClassroomClient();
    if (!classroom) {
      throw new Error("UNAUTHORIZED");
    }

    const coursesRes = await classroom.courses.list({
      courseStates: ["ACTIVE"],
    });

    const courses = coursesRes.data.courses ?? [];
    const allPending: Assignment[] = [];

    for (const course of courses) {
      if (!course.id || !course.name) continue;

      const courseworkRes = await classroom.courses.courseWork.list({
        courseId: course.id,
      });

      const courseWorks = courseworkRes.data.courseWork ?? [];

      for (const cw of courseWorks) {
        if (!cw.id || !cw.title) continue;

        const submissionsRes = await classroom.courses.courseWork.studentSubmissions.list({
          courseId: course.id,
          courseWorkId: cw.id,
        });

        const submissions = submissionsRes.data.studentSubmissions ?? [];
        const mySubmission = submissions[0];

        let isEligible = false;
        let statusLabel = "belum diketahui";

        if (mySubmission) {
          const state = mySubmission.state;
          if (state === "CREATED" || state === "RECLAIMED_BY_STUDENT") {
            isEligible = true;
            statusLabel = "belum dikumpulkan";
          }
        } else {
          isEligible = true;
          statusLabel = "belum diketahui";
        }

        if (isEligible) {
          const dueAt = this.convertClassroomDateToISO(cw.dueDate, cw.dueTime);

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

    return allPending;
  }

  private convertClassroomDateToISO(
    date?: classroom_v1.Schema$Date,
    time?: classroom_v1.Schema$TimeOfDay,
  ): string | null {
    if (!date || !date.year || !date.month || !date.day) {
      return null;
    }

    const hours = time?.hours ?? 23;
    const minutes = time?.minutes ?? 59;

    const d = new Date(date.year, date.month - 1, date.day, hours, minutes);
    return d.toISOString();
  }
}
