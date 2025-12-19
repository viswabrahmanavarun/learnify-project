"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { FiCheckCircle, FiArrowLeft } from "react-icons/fi";

/* =========================
   TYPES
========================= */
interface Course {
  id: number;
  title: string;
  description: string;
}

interface Chapter {
  id: number;
  title: string;
  content: string;
}

/* =========================
   COURSE DETAIL PAGE
========================= */
export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [completedChapterIds, setCompletedChapterIds] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  /* =========================
     FETCH COURSE DATA
  ========================= */
  const loadData = async () => {
    if (!courseId) return;

    try {
      const [courseRes, chaptersRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/chapters`),
        api.get(`/courses/${courseId}/progress`),
      ]);

      setCourse(courseRes.data);
      setChapters(chaptersRes.data || []);
      setProgress(progressRes.data?.progress ?? 0);
      setCompletedChapterIds(
        progressRes.data?.completedChapterIds || []
      );
    } catch (error) {
      console.error("Failed to load course", error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  /* =========================
     MARK CHAPTER COMPLETED
  ========================= */
  const markCompleted = async (chapterId: number) => {
    if (completedChapterIds.includes(chapterId)) return;

    try {
      setUpdating(chapterId);

      await api.post(`/chapters/${chapterId}/complete`);

      // ✅ SAFE optimistic update (no duplicates)
      setCompletedChapterIds((prev) =>
        Array.from(new Set([...prev, chapterId]))
      );

      // Refresh progress
      await loadData();
    } catch (error: any) {
      if (error.response?.status === 409) {
        setCompletedChapterIds((prev) =>
          Array.from(new Set([...prev, chapterId]))
        );
      } else {
        console.error("Completion error", error);
      }
    } finally {
      setUpdating(null);
    }
  };

  /* =========================
     UI STATES
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        Loading course...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Course not found
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen px-6 py-10 flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      <div className="relative w-full max-w-5xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 text-white">

        {/* BACK */}
        <button
          onClick={() => router.push("/dashboard/student/enrolled")}
          className="absolute left-8 top-8 flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <FiArrowLeft />
          Back to Enrolled Courses
        </button>

        {/* HEADER */}
        <h1 className="text-4xl font-bold mb-2">
          {course.title}
        </h1>
        <p className="text-white/80 mb-6">
          {course.description}
        </p>

        {/* PROGRESS */}
        <div className="mb-10">
          <div className="flex justify-between text-sm mb-1">
            <span>Course Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* CHAPTERS */}
        <div className="space-y-6">
          {chapters.map((chapter, index) => {
            const completed = completedChapterIds.includes(chapter.id);

            return (
              <div
                key={chapter.id}
                className="bg-white/10 border border-white/20 rounded-2xl p-6"
              >
                <p className="text-xs text-white/60 mb-1">
                  Chapter {index + 1}
                </p>

                <h3 className="text-xl font-semibold">
                  {chapter.title}
                </h3>

                <p className="mt-2 text-white/75">
                  {chapter.content}
                </p>

                <div className="mt-6 flex justify-end">
                  {completed ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-300 font-medium">
                      <FiCheckCircle />
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => markCompleted(chapter.id)}
                      disabled={updating === chapter.id}
                      className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition text-sm font-medium disabled:opacity-50"
                    >
                      {updating === chapter.id
                        ? "Saving..."
                        : "Mark as Completed"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
