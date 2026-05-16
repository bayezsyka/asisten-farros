import { google, classroom_v1 } from "googleapis";
import { env } from "../../config/env.js";
import { logger } from "../../core/logger.js";

export function getGoogleOAuth2Client() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    logger.warn("Google credentials missing. Classroom module will be disabled.");
    return null;
  }

  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
}
