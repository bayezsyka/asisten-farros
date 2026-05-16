import { promises as fs } from "fs";
import path from "path";
import type { Credentials } from "google-auth-library";
import { getGoogleOAuth2Client } from "../../infra/google/googleClient.js";

const TOKEN_PATH = path.join(process.cwd(), "data", "google-token.json");

export async function saveGoogleToken(tokens: Credentials): Promise<void> {
  await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), "utf-8");
}

export async function loadGoogleToken(): Promise<Credentials | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

export async function getAuthorizedClassroomClient() {
  const tokens = await loadGoogleToken();
  if (!tokens) {
    return null;
  }

  const oauth2Client = getGoogleOAuth2Client();
  if (!oauth2Client) return null;

  oauth2Client.setCredentials(tokens);
  
  // We don't initialize google.classroom here directly because it imports all of googleapis.
  // Instead, we just return the authenticated client. Or we can just import google here too.
  const { google } = await import("googleapis");
  return google.classroom({ version: "v1", auth: oauth2Client });
}

export function getAuthUrl(): string | null {
  const oauth2Client = getGoogleOAuth2Client();
  if (!oauth2Client) return null;

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/classroom.courses.readonly",
      "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
      "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
    ],
  });
}

export async function handleAuthCallback(code: string): Promise<boolean> {
  const oauth2Client = getGoogleOAuth2Client();
  if (!oauth2Client) return false;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    await saveGoogleToken(tokens);
    return true;
  } catch (err) {
    console.error("Error exchanging auth code", err);
    return false;
  }
}
