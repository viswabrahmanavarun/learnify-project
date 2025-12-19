import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/client";

export const approveMentor = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const mentorId = Number(req.params.id);

    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor || mentor.role !== Role.MENTOR) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const updatedMentor = await prisma.user.update({
      where: { id: mentorId },
      data: { approved: true },
    });

    return res.json({
      message: "Mentor approved successfully",
      mentor: {
        id: updatedMentor.id,
        name: updatedMentor.name,
        email: updatedMentor.email,
        approved: updatedMentor.approved,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
