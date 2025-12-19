import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { Role } from "../generated/prisma/client";
import {
  generateCertificate,
  getMyCertificates,
  downloadCertificate,
} from "../controllers/certificate.controller";

const router = Router();

/* =========================
   GENERATE CERTIFICATE
========================= */
router.post(
  "/courses/:courseId/certificate",
  authenticate,
  authorize([Role.STUDENT]),
  generateCertificate
);

/* =========================
   DOWNLOAD CERTIFICATE (PDF)
========================= */
router.get(
  "/courses/:courseId/certificate/download",
  authenticate,
  authorize([Role.STUDENT]),
  downloadCertificate
);

/* =========================
   VIEW MY CERTIFICATES
========================= */
router.get(
  "/certificates/my",
  authenticate,
  authorize([Role.STUDENT]),
  getMyCertificates
);

export default router;
