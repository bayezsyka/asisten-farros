import { Router } from "express";
import { google } from "googleapis";
import { saveGoogleToken } from "../../services/google-token-service.js";

const router = Router();

const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
];

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

router.get("/", (req, res) => {
  const oauth2Client = getOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("Gagal menghubungkan Classroom. Silakan coba lagi.");
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    await saveGoogleToken(tokens);

    res.send(`
      <html>
        <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5;">
          <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <h1 style="color: #1a73e8; margin-top: 0;">Berhasil!</h1>
            <p>Classroom berhasil terhubung. Silakan kembali ke WhatsApp.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Gagal menukarkan code:", error);
    res.status(500).send(`
      <html>
        <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5;">
          <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center;">
            <h1 style="color: #d93025; margin-top: 0;">Gagal</h1>
            <p>Gagal menghubungkan Classroom. Silakan coba lagi.</p>
          </div>
        </body>
      </html>
    `);
  }
});

export default router;
