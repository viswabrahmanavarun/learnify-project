import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/client";

/* =========================
   ADD CHAPTER (MENTOR)
========================= */
export const addChapter = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const courseId = Number(req.params.courseId);
    const { title, content } = req.body;

    // Validation
    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    // Only mentors
    if (user.role !== Role.MENTOR) {
      return res.status(403).json({ message: "Only mentors allowed" });
    }

    // Fetch course with mentor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { mentor: true },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Ownership check
    if (course.mentorId !== Number(user.userId)) {
      return res.status(403).json({ message: "Not your course" });
    }

    // Mentor approval check
    if (!course.mentor.approved) {
      return res
        .status(403)
        .json({ message: "Mentor not approved by admin" });
    }

    const chapter = await prisma.chapter.create({
      data: {
        title,
        content,
        courseId,
      },
    });

    return res.status(201).json({
      message: "Chapter added successfully",
      chapter,
    });
  } catch (error) {
    console.error("Add chapter error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET COURSE CHAPTERS
========================= */
export const getCourseChapters = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user!;
    const courseId = Number(req.params.courseId);

    // Check course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // If student → must be enrolled
    if (user.role === Role.STUDENT) {
      const enrolled = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: Number(user.userId),
            courseId,
          },
        },
      });

      if (!enrolled) {
        return res
          .status(403)
          .json({ message: "Enroll in course to view chapters" });
      }
    }

    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      orderBy: { createdAt: "asc" },
    });

    return res.json(chapters);
  } catch (error) {
    console.error("Get chapters error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DELETE CHAPTER (MENTOR)
========================= */
export const deleteChapter = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user!;
    const chapterId = Number(req.params.chapterId);

    // Only mentors
    if (user.role !== Role.MENTOR) {
      return res.status(403).json({ message: "Only mentors allowed" });
    }

    // Find chapter with course + mentor
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: {
          include: { mentor: true },
        },
      },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Ownership check
    if (chapter.course.mentorId !== Number(user.userId)) {
      return res.status(403).json({
        message: "Not allowed to delete this chapter",
      });
    }

    // Mentor approval check
    if (!chapter.course.mentor.approved) {
      return res.status(403).json({
        message: "Mentor not approved by admin",
      });
    }

    await prisma.chapter.delete({
      where: { id: chapterId },
    });

    return res.json({ message: "Chapter deleted successfully" });
  } catch (error) {
    console.error("Delete chapter error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
