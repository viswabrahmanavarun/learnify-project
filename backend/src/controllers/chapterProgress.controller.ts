import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/client";

/* =========================
   COMPLETE CHAPTER (STUDENT)
   🔥 AUTO CERTIFICATE LOGIC
========================= */
export const completeChapter = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const chapterId = Number(req.params.chapterId);

    if (!user || user.role !== Role.STUDENT) {
      return res.status(403).json({ message: "Only students allowed" });
    }

    /* =========================
       VALIDATE CHAPTER
    ========================= */
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    /* =========================
       CHECK ENROLLMENT
    ========================= */
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: Number(user.userId),
          courseId: chapter.courseId,
        },
      },
    });

    if (!enrollment) {
      return res.status(403).json({ message: "Not enrolled in course" });
    }

    /* =========================
       PREVENT DUPLICATE CHAPTER
    ========================= */
    const existing = await prisma.chapterProgress.findUnique({
      where: {
        studentId_chapterId: {
          studentId: Number(user.userId),
          chapterId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ message: "Already completed" });
    }

    /* =========================
       SAVE CHAPTER PROGRESS
    ========================= */
    await prisma.chapterProgress.create({
      data: {
        studentId: Number(user.userId),
        chapterId,
      },
    });

    /* =========================
       🔥 AUTO CERTIFICATE CHECK
    ========================= */
    const totalChapters = await prisma.chapter.count({
      where: { courseId: chapter.courseId },
    });

    const completedChapters = await prisma.chapterProgress.count({
      where: {
        studentId: Number(user.userId),
        chapter: { courseId: chapter.courseId },
      },
    });

    if (totalChapters > 0 && completedChapters === totalChapters) {
      const existingCertificate = await prisma.certificate.findUnique({
        where: {
          studentId_courseId: {
            studentId: Number(user.userId),
            courseId: chapter.courseId,
          },
        },
      });

      if (!existingCertificate) {
        await prisma.certificate.create({
          data: {
            studentId: Number(user.userId),
            courseId: chapter.courseId,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Chapter completed successfully",
    });
  } catch (error) {
    console.error("Complete chapter error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET COURSE PROGRESS (STUDENT)
   GET /courses/:courseId/progress
========================= */
export const getCourseProgress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user;
    const courseId = Number(req.params.courseId);

    if (!user || user.role !== Role.STUDENT) {
      return res.status(403).json({
        message: "Only students allowed",
      });
    }

    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      select: { id: true },
    });

    const chapterIds = chapters.map((c) => c.id);

    if (chapterIds.length === 0) {
      return res.status(200).json({
        progress: 0,
        completedChapterIds: [],
      });
    }

    const completed = await prisma.chapterProgress.findMany({
      where: {
        studentId: Number(user.userId),
        chapterId: { in: chapterIds },
      },
      select: { chapterId: true },
    });

    const completedChapterIds = completed.map((c) => c.chapterId);

    const progress = Math.round(
      (completedChapterIds.length / chapterIds.length) * 100
    );

    return res.status(200).json({
      progress,
      completedChapterIds,
    });
  } catch (error) {
    console.error("Get course progress error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
