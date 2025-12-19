import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/client";

/* =========================
   REGISTER STUDENT
========================= */
export const registerStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.STUDENT,
      },
    });

    return res.status(201).json({
      message: "Student registered successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   REGISTER MENTOR
========================= */
export const registerMentor = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password required" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.MENTOR,
      },
    });

    return res.status(201).json({
      message: "Mentor registered successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   CREATE ADMIN (TEMP)
========================= */
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    return res.status(201).json({
      message: "Admin created successfully",
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =========================
   LOGIN (ALL ROLES)
========================= */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    // ✅ FIXED RESPONSE (CRITICAL)
    return res.status(200).json({
      token,
      role: user.role,
      userId: user.id, // 🔥 THIS WAS MISSING
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
