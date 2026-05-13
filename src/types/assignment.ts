export type AssignmentProvider = "google_classroom" | "microsoft_teams";

export type Assignment = {
  id: string;
  provider: AssignmentProvider;
  courseName: string;
  title: string;
  dueAt: string | null;
  status: string;
  isPending: boolean;
  link?: string;
};
