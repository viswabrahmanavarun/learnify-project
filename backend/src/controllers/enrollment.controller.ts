import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/client";

/* =========================
   ENROLL IN COURSE
========================= */
export const enrollInCourse = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const courseId = Number(req.params.courseId);

  if (!user || user.role !== Role.STUDENT) {
    return res.status(403).json({ message: "Only students can enroll" });
  }

  if (isNaN(courseId)) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const already = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: Number(user.userId),
        courseId,
      },
    },
  });

  if (already) {
    return res.status(400).json({ message: "Already enrolled" });
  }

  await prisma.enrollment.create({
    data: {
      studentId: Number(user.userId),
      courseId,
    },
  });

  return res.status(201).json({ message: "Enrolled successfully" });
};

/* =========================
   STUDENT: MY ENROLLED COURSES
========================= */
export const getMyEnrolledCourses = async (
  req: AuthRequest,
  res: Response
) => {
  const user = req.user;

  if (!user || user.role !== Role.STUDENT) {
    return res.status(403).json({ message: "Only students allowed" });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: Number(user.userId) },
    include: { course: true },
  });

  return res.status(200).json(
    enrollments.map((e) => e.course)
  );
};
