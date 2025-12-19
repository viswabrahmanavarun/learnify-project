"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FiBookOpen,
  FiCheckCircle,
  FiPlusCircle,
  FiArrowLeft,
} from "react-icons/fi";

/* =========================
   TYPES
========================= */
type Course = {
  id: number;
  title: string;
  description: string;
};

/* =========================
   STUDENT COURSES PAGE
========================= */
export default function StudentCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     AUTH + FETCH DATA
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "STUDENT") {
      router.replace("/auth/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [coursesRes, enrolledRes] = await Promise.all([
          api.get("/courses"),
          api.get("/courses/enrolled"),
        ]);

        setCourses(coursesRes.data || []);

        const ids = (enrolledRes.data || []).map(
          (course: Course) => course.id
        );
        setEnrolledIds(ids);
      } catch {
        setError("Unable to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  /* =========================
     ENROLL COURSE
  ========================= */
  const enrollCourse = async (courseId: number) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      setEnrolledIds((prev) => [...prev, courseId]);
    } catch {
      // ignore – UI already reflects state
    }
  };

  /* =========================
     LOADING / ERROR
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-red-400">
        {error}
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-6">
      {/* GLASS CARD */}
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
            Available Courses
          </h1>

          <p className="text-white/70 mt-3">
            Browse courses and enroll to start learning
          </p>
        </div>

        {/* COURSES */}
        {courses.length === 0 ? (
          <div className="text-center text-white/60">
            No courses available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isEnrolled = enrolledIds.includes(
                course.id
              );

              return (
                <div
                  key={course.id}
                  className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all flex flex-col"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-white/70 mb-6 flex-grow">
                    {course.description}
                  </p>

                  {isEnrolled ? (
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/80 text-sm font-medium cursor-default"
                    >
                      <FiCheckCircle />
                      Enrolled
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        enrollCourse(course.id)
                      }
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition text-sm font-medium"
                    >
                      <FiPlusCircle />
                      Enroll
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
