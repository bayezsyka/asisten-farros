import "dotenv/config";

function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is missing`);
  }
  return value;
}

export const env = {
  BAILEYS_AUTH_DIR: requireEnv("BAILEYS_AUTH_DIR", ".baileys_auth"),
  WHATSAPP_BOT_NAME: requireEnv("WHATSAPP_BOT_NAME", "Asisten Farros"),
  LOG_LEVEL: requireEnv("LOG_LEVEL", "info"),
  API_PORT: parseInt(requireEnv("ASISTEN_FARROS_API_PORT", "3007"), 10),
  API_BASE_URL: requireEnv("ASISTEN_FARROS_API_BASE_URL", "http://127.0.0.1:3007"),
  APP_PUBLIC_URL: requireEnv("APP_PUBLIC_URL", "https://tugas.farros.space"),

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: requireEnv("GOOGLE_REDIRECT_URI", "https://tugas.farros.space/auth/google/callback"),

  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  BOT_WA_NUMBER: requireEnv("BOT_WA_NUMBER", "6285161603362"),
  OWNER_WA_NUMBER: requireEnv("OWNER_WA_NUMBER", "6287721031021"),
  OWNER_DISPLAY_NAME: requireEnv("OWNER_DISPLAY_NAME", "Farros"),
  TZ: requireEnv("TZ", "Asia/Jakarta"),
};
