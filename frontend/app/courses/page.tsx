"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FiBookOpen,
  FiUser,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";

/* =========================
   TYPES
========================= */
interface Course {
  id: number;
  title: string;
  description: string;
  mentor?: {
    name: string;
  };
}

/* =========================
   COURSES PAGE
========================= */
export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH COURSES
  ========================= */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data || []);
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        <p className="animate-pulse text-lg">
          Loading courses...
        </p>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-6">
      {/* GLASS CARD */}
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 text-white">

        {/* HEADER */}
        <div className="mb-10 text-center relative">
          {/* BACK BUTTON */}
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-1 flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
          >
            <FiArrowLeft />
            Back
          </button>

          <h1 className="text-4xl font-bold tracking-wide flex items-center justify-center gap-3">
            <FiBookOpen className="text-blue-400" />
            Available Courses
          </h1>

          <p className="text-white/70 mt-3">
            Explore and enroll in curated learning paths
          </p>
        </div>

        {/* COURSES GRID */}
        {courses.length === 0 ? (
          <p className="text-center text-white/60">
            No courses available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 transition-all hover:bg-white/15 hover:scale-[1.02]"
              >
                {/* TITLE */}
                <h2 className="text-xl font-semibold mb-2">
                  {course.title}
                </h2>

                {/* DESCRIPTION */}
                <p className="text-white/70 text-sm mb-5 line-clamp-3">
                  {course.description}
                </p>

                {/* FOOTER */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-white/60">
                    <FiUser />
                    {course.mentor?.name ?? "Unknown Mentor"}
                  </span>

                  {/* VIEW COURSE → opens /courses/[id] */}
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition"
                  >
                    View Course
                    <FiArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
