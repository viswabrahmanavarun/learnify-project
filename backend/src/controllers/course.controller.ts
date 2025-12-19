import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

/* =========================
   CREATE COURSE (MENTOR)
========================= */
export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    const user = req.user;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description required",
      });
    }

    if (!user || user.role !== Role.MENTOR) {
      return res.status(403).json({
        message: "Only mentors can create courses",
      });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        mentorId: Number(user.userId),
      },
    });

    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   VIEW ALL COURSES (PUBLIC)
========================= */
export const getAllCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        mentorId: true,
      },
    });

    return res.status(200).json(courses);
  } catch (error) {
    console.error("Get all courses error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   VIEW SINGLE COURSE (PUBLIC)
========================= */
export const getCourseById = async (req: Request, res: Response) => {
  const courseId = Number(req.params.id);

  if (isNaN(courseId)) {
    return res.status(400).json({
      message: "Invalid course ID",
    });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        mentorId: true,
      },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.error("Get course by id error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   VIEW ENROLLED COURSES (STUDENT)
   ✅ LIVE PROGRESS (FIXED)
========================= */
export const getEnrolledCourses = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user || user.role !== Role.STUDENT) {
      return res.status(403).json({ message: "Only students allowed" });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: Number(user.userId) },
    });

    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await prisma.course.findUnique({
          where: { id: enrollment.courseId },
          select: { id: true, title: true, description: true },
        });

        if (!course) return null;

        const totalChapters = await prisma.chapter.count({
          where: { courseId: course.id },
        });

        const completedChapters = await prisma.chapterProgress.count({
          where: {
            studentId: Number(user.userId),
            chapter: { courseId: course.id },
          },
        });

        const progress =
          totalChapters === 0
            ? 0
            : Math.round((completedChapters / totalChapters) * 100);

        return {
          ...course,
          progress,
          completed: progress === 100,
        };
      })
    );

    return res.json(courses.filter(Boolean));
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


/* =========================
   VIEW MY COURSES (MENTOR)
========================= */
export const getMyCourses = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user || user.role !== Role.MENTOR) {
      return res.status(403).json({
        message: "Only mentors can view their courses",
      });
    }

    const courses = await prisma.course.findMany({
      where: {
        mentorId: Number(user.userId),
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

    return res.status(200).json(courses);
  } catch (error) {
    console.error("Get my courses error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DELETE COURSE (MENTOR + OWNER ONLY)
========================= */
export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const courseId = Number(req.params.id);

    if (!user || user.role !== Role.MENTOR) {
      return res.status(403).json({
        message: "Only mentors can delete courses",
      });
    }

    if (isNaN(courseId)) {
      return res.status(400).json({
        message: "Invalid course ID",
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, mentorId: true },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.mentorId !== Number(user.userId)) {
      return res.status(403).json({
        message: "You are not allowed to delete this course",
      });
    }

    /* 🧹 CLEAN DELETE ORDER */
    await prisma.chapterProgress.deleteMany({
      where: {
        chapter: { courseId },
      },
    });

    await prisma.chapter.deleteMany({
      where: { courseId },
    });

    await prisma.enrollment.deleteMany({
      where: { courseId },
    });

    await prisma.course.delete({
      where: { id: courseId },
    });

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
