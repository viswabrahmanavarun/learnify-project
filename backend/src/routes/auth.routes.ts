import { Router } from "express";
import {
  registerStudent,
  registerMentor,
  login,
  createAdmin,
} from "../controllers/auth.controller";

const router = Router();

/* =========================
   AUTH ROUTES
========================= */

// Create admin (TEMP – for setup/testing)
router.post("/auth/create-admin", createAdmin);

// Student registration
router.post("/auth/register/student", registerStudent);

// Mentor registration
router.post("/auth/register/mentor", registerMentor);

// Login (Student / Mentor / Admin)
router.post("/auth/login", login);

export default router;
