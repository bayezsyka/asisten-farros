import { Router } from "express";
import { getDummyAssignments } from "../../services/dummy-assignment-service.js";
import { sortPendingAssignments } from "../../services/formatter-service.js";
import { getClassroomPendingAssignments } from "../../services/classroom-assignment-service.js";
import {
  loadClassroomCache,
  saveClassroomCache,
} from "../../services/classroom-cache-service.js";

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
    const cache = await loadClassroomCache();

    if (!cache || cache.assignments.length === 0) {
      return res.status(409).json({
        ok: false,
        message: "Cache Classroom kosong. Jalankan sync classroom dulu.",
      });
    }

    const sortedAssignments = sortPendingAssignments(cache.assignments);
    res.json(sortedAssignments);
  } catch (error) {
    console.error("Gagal mengambil data tugas Classroom dari cache:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/classroom/sync", async (req, res) => {
  try {
    const assignments = await getClassroomPendingAssignments();
    const cache = await saveClassroomCache(assignments);

    res.json({
      ok: true,
      syncedAt: cache.syncedAt,
      count: assignments.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return res.status(401).json({
        ok: false,
        message: "Classroom belum terhubung.",
      });
    }

    console.error("Gagal sinkronisasi Classroom:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/classroom/cache-status", async (req, res) => {
  try {
    const cache = await loadClassroomCache();

    if (cache) {
      return res.json({
        ok: true,
        hasCache: true,
        syncedAt: cache.syncedAt,
        count: cache.assignments.length,
      });
    }

    res.json({
      ok: true,
      hasCache: false,
      syncedAt: null,
      count: 0,
    });
  } catch (error) {
    console.error("Gagal mengecek status cache Classroom:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
