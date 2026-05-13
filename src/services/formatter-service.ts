import type { Assignment, AssignmentProvider } from "../types/assignment.js";

const providerLabels: Record<AssignmentProvider, string> = {
  google_classroom: "Google Classroom",
  microsoft_teams: "Microsoft Teams",
};

function formatDueAt(dueAt: string | null): string {
  if (!dueAt) {
    return "belum ditentukan";
  }

  const date = new Date(dueAt);

  if (Number.isNaN(date.getTime())) {
    return "belum ditentukan";
  }

  const datePart = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  })
    .format(date)
    .replace(":", ".");

  return `${datePart}, ${timePart}`;
}

export function sortPendingAssignments(assignments: Assignment[]): Assignment[] {
  return [...assignments].sort((left, right) => {
    if (!left.dueAt && !right.dueAt) {
      return left.courseName.localeCompare(right.courseName, "id-ID");
    }

    if (!left.dueAt) {
      return 1;
    }

    if (!right.dueAt) {
      return -1;
    }

    const leftTime = new Date(left.dueAt).getTime();
    const rightTime = new Date(right.dueAt).getTime();

    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
      return left.courseName.localeCompare(right.courseName, "id-ID");
    }

    if (Number.isNaN(leftTime)) {
      return 1;
    }

    if (Number.isNaN(rightTime)) {
      return -1;
    }

    return leftTime - rightTime;
  });
}

export function formatAssignmentsMessage(assignments: Assignment[]): string {
  if (assignments.length === 0) {
    return "Belum ada tugas yang tercatat belum selesai.";
  }

  const lines = [`Ada ${assignments.length} tugas yang belum selesai.`, ""];

  assignments.forEach((assignment, index) => {
    lines.push(`${index + 1}. ${assignment.courseName} - ${assignment.title}`);
    lines.push(`   Sumber: ${providerLabels[assignment.provider]}`);
    lines.push(`   Tenggat: ${formatDueAt(assignment.dueAt)}`);
    lines.push(`   Status: ${assignment.status}`);

    if (index < assignments.length - 1) {
      lines.push("");
    }
  });

  return lines.join("\n");
}
