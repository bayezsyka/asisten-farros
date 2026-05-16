import express from "express";
import { getAllPendingTasks } from "../../modules/tasks/taskService.js";

const router = express.Router();

router.get("/pending", async (req, res) => {
  try {
    const tasks = await getAllPendingTasks();
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      res.status(401).json({ success: false, message: "Google Classroom unauthorized" });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

export default router;
