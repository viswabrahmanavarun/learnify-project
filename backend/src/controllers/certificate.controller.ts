import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Role } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { generateCertificatePDF } from "../utils/pdfGenerator";

/* =========================
   GENERATE CERTIFICATE
   (Manual – Optional)
========================= */
export const generateCertificate = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user!;
    const courseId = Number(req.params.courseId);

    // Only students
    if (user.role !== Role.STUDENT) {
      return res
        .status(403)
        .json({ message: "Only students can generate certificates" });
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: Number(user.userId),
          courseId,
        },
      },
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "Enroll in course first" });
    }

    // Prevent duplicate certificate
    const existingCertificate = await prisma.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId: Number(user.userId),
          courseId,
        },
      },
    });

    if (existingCertificate) {
      return res
        .status(409)
        .json({ message: "Certificate already generated" });
    }

    // Total chapters
    const totalChapters = await prisma.chapter.count({
      where: { courseId },
    });

    if (totalChapters === 0) {
      return res
        .status(400)
        .json({ message: "Course has no chapters" });
    }

    // Completed chapters
    const completedChapters = await prisma.chapterProgress.count({
      where: {
        studentId: Number(user.userId),
        chapter: { courseId },
      },
    });

    if (completedChapters !== totalChapters) {
      return res.status(400).json({
        message: "Complete all chapters to get certificate",
      });
    }

    // Create certificate 🎓
    const certificate = await prisma.certificate.create({
      data: {
        studentId: Number(user.userId),
        courseId,
      },
    });

    return res.status(201).json({
      message: "Certificate generated successfully",
      certificate,
    });
  } catch (error) {
    console.error("Generate certificate error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DOWNLOAD CERTIFICATE (PDF)
   🎨 Styled – Learnify
========================= */
export const downloadCertificate = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user!;
    const courseId = Number(req.params.courseId);

    if (user.role !== Role.STUDENT) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const certificate = await prisma.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId: Number(user.userId),
          courseId,
        },
      },
      include: {
        course: {
          select: { title: true },
        },
        student: {
          select: { name: true },
        },
      },
    });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Generate styled PDF 🎓
    return generateCertificatePDF(res, {
      studentName: certificate.student.name,
      courseTitle: certificate.course.title,
      issuedAt: certificate.issuedAt,
      certificateNo: certificate.certificateNo,
    });
  } catch (error) {
    console.error("Download certificate error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET MY CERTIFICATES
========================= */
export const getMyCertificates = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const user = req.user!;

    if (user.role !== Role.STUDENT) {
      return res.status(403).json({ message: "Only students allowed" });
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        studentId: Number(user.userId),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    return res.json(certificates);
  } catch (error) {
    console.error("Get certificates error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
