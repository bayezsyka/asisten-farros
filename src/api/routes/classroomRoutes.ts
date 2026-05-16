import express from "express";
import { handleAuthCallback } from "../../modules/classroom/classroomAuthService.js";

const router = express.Router();

router.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).send("No auth code found");
    return;
  }

  const success = await handleAuthCallback(code);
  if (success) {
    res.send("Google Classroom berhasil dihubungkan! Anda bisa menutup halaman ini dan kembali ke WhatsApp.");
  } else {
    res.status(500).send("Gagal mengautentikasi Google Classroom.");
  }
});

export default router;
