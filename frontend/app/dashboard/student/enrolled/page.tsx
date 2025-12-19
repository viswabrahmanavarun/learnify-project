"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FiBookOpen,
  FiPlay,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";

/* =========================
   TYPES
========================= */
interface Course {
  id: number;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
}

/* =========================
   STUDENT ENROLLED COURSES
========================= */
export default function EnrolledCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH ENROLLED COURSES
  ========================= */
  const fetchEnrolledCourses = async () => {
    try {
      const res = await api.get("/courses/enrolled");

      const safeCourses: Course[] = (res.data || []).map(
        (course: any) => {
          const rawProgress =
            typeof course.progress === "number"
              ? course.progress
              : 0;

          const progress = Math.min(
            100,
            Math.max(0, rawProgress)
          );

          return {
            id: course.id,
            title: course.title,
            description: course.description,
            progress,
            completed: progress === 100,
          };
        }
      );

      setCourses(safeCourses);
    } catch (error) {
      console.error(
        "Failed to fetch enrolled courses",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     AUTH + LOAD
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "STUDENT") {
      router.replace("/auth/login");
      return;
    }

    fetchEnrolledCourses();
  }, [router]);

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        <p className="animate-pulse text-lg">
          Loading enrolled courses...
        </p>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-6">
      <div className="relative w-full max-w-6xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 text-white">

        {/* BACK */}
        <button
          onClick={() => router.push("/dashboard/student")}
          className="absolute left-8 top-8 flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        {/* HEADER */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <FiBookOpen className="text-blue-400" />
            My Enrolled Courses
          </h1>

          <p className="text-white/70 mt-3">
            Continue learning from where you left off
          </p>
        </div>

        {/* EMPTY STATE */}
        {courses.length === 0 ? (
          <div className="text-center text-white/60">
            You haven’t enrolled in any courses yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all flex flex-col"
              >
                {/* TITLE */}
                <h2 className="text-xl font-semibold mb-2">
                  {course.title}
                </h2>

                {/* DESCRIPTION */}
                <p className="text-sm text-white/70 mb-6 flex-grow">
                  {course.description}
                </p>

                {/* PROGRESS */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>

                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-2 transition-all duration-700"
                      style={{
                        width: `${course.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* ACTION */}
                {course.completed ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/80 text-sm font-medium">
                    <FiCheckCircle />
                    Completed
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      router.push(`/courses/${course.id}`)
                    }
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 transition text-sm font-medium"
                  >
                    <FiPlay />
                    Continue Course
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
