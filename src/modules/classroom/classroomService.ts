import { Assignment, TaskProvider } from "../tasks/taskTypes.js";
import { getAuthorizedClassroomClient } from "./classroomAuthService.js";
import { classroom_v1 } from "googleapis";
import { buildUtcDateFromClassroomDue } from "../../core/date.js";

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
          const dueAtDate = buildUtcDateFromClassroomDue(cw.dueDate, cw.dueTime);
          const dueAt = dueAtDate ? dueAtDate.toISOString() : null;
          const hasTime = cw.dueTime !== undefined;

          if (dueAtDate) {
            const now = new Date();
            const diffDays = (now.getTime() - dueAtDate.getTime()) / (1000 * 3600 * 24);

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
              hasTime,
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
}
