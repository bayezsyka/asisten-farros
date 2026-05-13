import type { Assignment } from "../types/assignment.js";

export async function fetchPendingAssignments(): Promise<Assignment[]> {
  const baseUrl = process.env.ASISTEN_FARROS_API_BASE_URL ?? "http://127.0.0.1:3007";
  const url = `${baseUrl}/assignments/pending`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("API response is not an array");
  }

  return data as Assignment[];
}

export async function fetchClassroomPendingAssignments(): Promise<Assignment[]> {
  const baseUrl = process.env.ASISTEN_FARROS_API_BASE_URL ?? "http://127.0.0.1:3007";
  const url = `${baseUrl}/assignments/classroom/pending`;

  const response = await fetch(url);

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error(`API returned status ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("API response is not an array");
  }

  return data as Assignment[];
}
