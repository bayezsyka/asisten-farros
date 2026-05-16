export interface Assignment {
  id: string;
  provider: "google_classroom" | "microsoft_graph" | "manual";
  courseName: string;
  title: string;
  dueAt: string | null;
  status: string;
  isPending: boolean;
  link?: string;
}

export interface TaskProvider {
  name: string;
  getPendingTasks(): Promise<Assignment[]>;
}
