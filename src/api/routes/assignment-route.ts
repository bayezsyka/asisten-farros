import { Router } from "express";
import { getDummyAssignments } from "../../services/dummy-assignment-service.js";
import { sortPendingAssignments } from "../../services/formatter-service.js";
import { getClassroomPendingAssignments } from "../../services/classroom-assignment-service.js";

const router = Router();

router.get("/pending", async (req, res) => {
  try {
    const assignments = await getDummyAssignments();
    const pendingAssignments = sortPendingAssignments(
      assignments.filter((assignment) => assignment.isPending),
    );

    res.json(pendingAssignments);
  } catch (error) {
    console.error("Gagal mengambil data tugas:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/classroom/pending", async (req, res) => {
  try {
    const assignments = await getClassroomPendingAssignments();
    res.json(assignments);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return res.status(401).json({
        ok: false,
        message: "Classroom belum terhubung.",
      });
    }

    console.error("Gagal mengambil data tugas Classroom:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
