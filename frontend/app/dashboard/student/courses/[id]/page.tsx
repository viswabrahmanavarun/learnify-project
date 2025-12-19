"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

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
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /* =========================
     FETCH COURSE + META
  ========================= */
  useEffect(() => {
    if (!courseId) return;

    const load = async () => {
      try {
        const [courseRes, chaptersRes, progressRes] =
          await Promise.all([
            api.get(`/courses/${courseId}`),
            api.get(`/courses/${courseId}/chapters`),
            api.get(`/courses/${courseId}/progress`),
          ]);

        setCourse(courseRes.data);
        setChapters(chaptersRes.data || []);
        setProgress(progressRes.data?.progress || 0);
      } catch (err) {
        console.error("Failed to load course", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

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

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-red-400">
        Course not found
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen px-6 py-12 flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-10 text-white">

        {/* HEADER */}
        <h1 className="text-4xl font-bold mb-3">
          {course.title}
        </h1>

        <p className="text-white/80 mb-10 text-lg">
          {course.description}
        </p>

        {/* INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* PROGRESS */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <p className="text-sm text-white/60">Progress</p>
            <p className="text-2xl font-semibold mt-1">
              {progress}%
            </p>

            <div className="mt-3 w-full bg-white/20 rounded h-2 overflow-hidden">
              <div
                className="bg-green-500 h-2"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* CHAPTERS */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <p className="text-sm text-white/60">Chapters</p>
            <p className="text-2xl font-semibold mt-1">
              {chapters.length}
            </p>
          </div>

          {/* STATUS */}
          <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <p className="text-sm text-white/60">Status</p>
            <p className="text-2xl font-semibold mt-1 text-green-400">
              Enrolled
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() =>
              router.push(`/student/courses/${course.id}/chapters`)
            }
            className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition font-semibold"
          >
            ▶ Continue Course
          </button>

          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition border border-white/20"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
