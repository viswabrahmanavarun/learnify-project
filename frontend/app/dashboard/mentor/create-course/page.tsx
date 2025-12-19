"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FiBookOpen,
  FiEdit3,
  FiArrowLeft,
  FiPlusCircle,
} from "react-icons/fi";

/* =========================
   MENTOR CREATE COURSE
========================= */
export default function CreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     AUTH CHECK (MENTOR ONLY)
  ========================= */
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "MENTOR") {
      router.replace("/auth/login");
    }
  }, [router]);

  /* =========================
     SUBMIT HANDLER
  ========================= */
  const handleCreateCourse = async () => {
    if (!title || !description) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/courses", {
        title,
        description,
      });

      router.push("/dashboard/mentor");
    } catch (error) {
      alert("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-6">
      {/* GLASS CARD */}
      <div className="w-full max-w-xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 text-white">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FiPlusCircle className="text-blue-400" />
            Create New Course
          </h1>
          <p className="text-white/70 mt-2">
            Provide course details to start building your content
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-6">
          {/* TITLE */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-white/80">
              <FiBookOpen />
              Course Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Node.js Fundamentals"
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-white/80">
              <FiEdit3 />
              Course Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what students will learn"
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleCreateCourse}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-medium transition ${
              loading
                ? "bg-gray-400/40 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Creating Course..." : "Create Course"}
          </button>
        </div>

        {/* BACK */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/dashboard/mentor")}
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white underline transition"
          >
            <FiArrowLeft />
            Back to Mentor Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
