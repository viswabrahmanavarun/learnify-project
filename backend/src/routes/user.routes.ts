import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { Role } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { approveMentor } from "../controllers/user.controller";


const router = Router();

/* =========================
   ADMIN: GET ALL USERS
========================= */
router.get(
  "/admin/users",
  authenticate,
  authorize([Role.ADMIN]),
  async (_req: AuthRequest, res: Response) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json(users);
  }
);
/* =========================
   ADMIN: APPROVE MENTOR
========================= */
router.patch(
  "/admin/approve-mentor/:id",
  authenticate,
  authorize([Role.ADMIN]),
  approveMentor
);


/* =========================
   GET MY PROFILE
========================= */
router.get(
  "/me",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const userId = Number(req.user!.userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json(user);
  }
);

export default router;
