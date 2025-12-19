import express, { Request, Response } from "express";
import cors from "cors";

/* =========================
   ROUTES
========================= */
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import courseRoutes from "./routes/course.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import chapterRoutes from "./routes/chapter.routes";
import chapterProgressRoutes from "./routes/chapterProgress.routes";
import certificateRoutes from "./routes/certificate.routes";

const app = express();

/* =========================
   GLOBAL MIDDLEWARES
========================= */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   HEALTH CHECK
========================= */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

/* =========================
   API ROUTES (✅ CLEAN & CORRECT)
========================= */
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", enrollmentRoutes);
app.use("/api", chapterRoutes);
app.use("/api", chapterProgressRoutes); // ✅ ONLY progress route
app.use("/api", certificateRoutes);

/* =========================
   FALLBACK
========================= */
app.use("*", (_req: Request, res: Response) => {
  res.status(404).json({ message: "API route not found" });
});

export default app;
