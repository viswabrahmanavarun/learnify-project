import { Router } from "express";
import {
  enrollInCourse,
  getMyEnrolledCourses,
} from "../controllers/enrollment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { Role } from "../generated/prisma/client";

const router = Router();

/* =========================
   STUDENT: ENROLL COURSE
========================= */
router.post(
  "/courses/:courseId/enroll",
  authenticate,
  authorize([Role.STUDENT]),
  enrollInCourse
);

/* =========================
   STUDENT: MY ENROLLED COURSES ✅
========================= */
router.get(
  "/courses/enrolled",
  authenticate,
  authorize([Role.STUDENT]),
  getMyEnrolledCourses
);

export default router;
