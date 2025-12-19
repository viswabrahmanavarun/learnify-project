import { Router } from "express";
import {
  completeChapter,
  getCourseProgress,
} from "../controllers/chapterProgress.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { Role } from "../generated/prisma/client";

const router = Router();

/* =========================
   COMPLETE CHAPTER
   POST /chapters/:chapterId/complete
========================= */
router.post(
  "/chapters/:chapterId/complete",
  authenticate,
  authorize([Role.STUDENT]),
  completeChapter
);

/* =========================
   COURSE PROGRESS
   GET /courses/:courseId/progress
========================= */
router.get(
  "/courses/:courseId/progress",
  authenticate,
  authorize([Role.STUDENT]),
  getCourseProgress
);

export default router;
