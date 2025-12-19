import { Router } from "express";
import {
  addChapter,
  getCourseChapters,
} from "../controllers/chapter.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { Role } from "../generated/prisma/client";

const router = Router();

/* =========================
   ADD CHAPTER (MENTOR)
========================= */
router.post(
  "/courses/:courseId/chapters",
  authenticate,
  authorize([Role.MENTOR]),
  addChapter
);

/* =========================
   VIEW CHAPTERS (STUDENT / MENTOR)
========================= */
router.get(
  "/courses/:courseId/chapters",
  authenticate,
  authorize([Role.STUDENT, Role.MENTOR]),
  getCourseChapters
);

export default router;
