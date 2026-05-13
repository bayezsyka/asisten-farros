import { google, classroom_v1 } from "googleapis";
import { loadGoogleToken } from "../services/google-token-service.js";

export async function getGoogleClassroomClient(): Promise<classroom_v1.Classroom | null> {
  const tokens = await loadGoogleToken();
  if (!tokens) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  oauth2Client.setCredentials(tokens);

  return google.classroom({ version: "v1", auth: oauth2Client });
}
