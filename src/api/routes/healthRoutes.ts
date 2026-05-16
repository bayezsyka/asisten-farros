import express from "express";
import { env } from "../../config/env.js";
import { supabase } from "../../infra/supabase/supabaseClient.js";
import { getGoogleOAuth2Client } from "../../infra/google/googleClient.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "asisten-farros",
    modules: {
      finance: !!supabase,
      classroom: !!getGoogleOAuth2Client(),
      reminders: true,
      tasks: true,
      commands: true,
      whatsapp: true,
    }
  });
});

export default router;
