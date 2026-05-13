import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "asisten-farros",
    status: "healthy",
  });
});

export default router;
