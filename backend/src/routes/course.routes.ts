import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  deleteCourse,
  getEnrolledCourses, // ✅ USE THIS
} from "../controllers/course.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { Role } from "../generated/prisma/client";

const router = Router();

/* =========================
   GET ALL COURSES (PUBLIC)
========================= */
router.get("/courses", getAllCourses);

/* =========================
   STUDENT: ENROLLED COURSES (🔥 FIXED)
========================= */
router.get(
  "/courses/enrolled",
  authenticate,
  authorize([Role.STUDENT]),
  getEnrolledCourses // ✅ CORRECT CONTROLLER
);

/* =========================
   GET COURSE BY ID
========================= */
router.get("/courses/:id", getCourseById);

/* =========================
   CREATE COURSE (MENTOR)
========================= */
router.post(
  "/courses",
  authenticate,
  authorize([Role.MENTOR]),
  createCourse
);

/* =========================
   DELETE COURSE
========================= */
router.delete(
  "/courses/:id",
  authenticate,
  authorize([Role.MENTOR]),
  deleteCourse
);

/* =========================
   MENTOR: MY COURSES
========================= */
router.get(
  "/my-courses",
  authenticate,
  authorize([Role.MENTOR]),
  getMyCourses
);

export default router;
