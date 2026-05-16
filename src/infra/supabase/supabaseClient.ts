import { createClient, SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { env } from "../../config/env.js";
import { logger } from "../../core/logger.js";

let supabaseInstance: SupabaseClient | null = null;

if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseInstance = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    realtime: {
      transport: WebSocket as any,
    },
  });
  logger.info("Supabase client initialized.");
} else {
  logger.warn("Supabase credentials missing. Finance module will be partially disabled.");
}

export const supabase = supabaseInstance;
