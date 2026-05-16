import express from "express";
import { syncAllTasks } from "../../modules/tasks/taskService.js";
import { getCachedTasks } from "../../modules/tasks/taskCacheService.js";

const router = express.Router();

router.get("/pending", async (req, res) => {
  try {
    let cache = await getCachedTasks();
    if (!cache) {
      cache = await syncAllTasks();
    }
    res.json({ success: true, count: cache.items.length, data: cache.items, syncedAt: cache.syncedAt });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || String(error.message).includes("invalid_grant")) {
      res.status(401).json({ success: false, message: "Google Classroom unauthorized" });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

export default router;
