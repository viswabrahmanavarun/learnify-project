"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FiLogOut,
  FiPlusCircle,
  FiBookOpen,
  FiSettings,
  FiTrash2,
} from "react-icons/fi";

/* =========================
   TYPES
========================= */
interface Course {
  id: number;
  title: string;
  description: string;
}

/* =========================
   MENTOR DASHBOARD
========================= */
export default function MentorDashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /* =========================
     AUTH CHECK (MENTOR ONLY)
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "MENTOR") {
      router.replace("/auth/login");
    }
  }, [router]);

  /* =========================
     FETCH MY COURSES
  ========================= */
  const fetchMyCourses = async () => {
    try {
      const res = await api.get("/my-courses");
      setCourses(res.data || []);
    } catch (error) {
      console.error("Failed to fetch mentor courses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  /* =========================
     DELETE COURSE (OWNER ONLY)
  ========================= */
  const deleteCourse = async (courseId: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this course?\nThis action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(courseId);
      await api.delete(`/courses/${courseId}`);

      // remove from UI immediately
      setCourses((prev) =>
        prev.filter((course) => course.id !== courseId)
      );
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Failed to delete course"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.clear();
    router.replace("/auth/login");
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        <p className="animate-pulse text-lg">
          Loading mentor dashboard...
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Mentor Dashboard
            </h1>
            <p className="text-white/70 mt-2">
              Create courses, manage chapters, and guide learners
            </p>
          </div>

          <button
            onClick={logout}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 transition text-sm"
          >
            <FiLogOut />
            Logout
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap gap-4 mb-12">
          <button
            onClick={() =>
              router.push("/dashboard/mentor/create-course")
            }
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-medium shadow"
          >
            <FiPlusCircle />
            Create New Course
          </button>

          <button
            onClick={() => router.push("/courses")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 hover:bg-white/30 transition font-medium"
          >
            <FiBookOpen />
            View All Courses
          </button>
        </div>

        {/* COURSES */}
        <h2 className="text-2xl font-semibold mb-6">
          My Courses
        </h2>

        {courses.length === 0 ? (
          <p className="text-white/60">
            You haven’t created any courses yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 transition-all hover:bg-white/15 hover:scale-[1.02]"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {course.title}
                </h3>

                <p className="text-white/70 text-sm mb-6 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex items-center justify-between">
                  {/* MANAGE */}
                  <button
                    onClick={() =>
                      router.push(
                        `/dashboard/mentor/course/${course.id}`
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition text-sm font-medium"
                  >
                    <FiSettings />
                    Manage
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteCourse(course.id)}
                    disabled={deletingId === course.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 transition text-sm font-medium disabled:opacity-50"
                  >
                    <FiTrash2 />
                    {deletingId === course.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
