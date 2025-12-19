"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FiBook,
  FiPlusCircle,
  FiTrash2,
  FiArrowLeft,
  FiFileText,
} from "react-icons/fi";

/* =========================
   TYPES
========================= */
interface Chapter {
  id: number;
  title: string;
  content: string;
}

/* =========================
   MENTOR MANAGE COURSE
========================= */
export default function MentorManageCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "MENTOR") {
      router.replace("/auth/login");
    }
  }, [router]);

  /* =========================
     FETCH CHAPTERS
  ========================= */
  const fetchChapters = async () => {
    try {
      const res = await api.get(`/courses/${courseId}/chapters`);
      setChapters(res.data || []);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to load chapters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  /* =========================
     ADD CHAPTER
  ========================= */
  const addChapter = async () => {
    if (!title || !content) {
      alert("Title and content are required");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/courses/${courseId}/chapters`, {
        title,
        content,
      });

      setTitle("");
      setContent("");
      fetchChapters();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add chapter");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     DELETE CHAPTER
  ========================= */
  const deleteChapter = async (chapterId: number) => {
    if (!confirm("Delete this chapter?")) return;

    try {
      await api.delete(`/chapters/${chapterId}`);
      fetchChapters();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete chapter");
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        <p className="animate-pulse text-lg">Loading chapters...</p>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-6">
      {/* FIXED HEIGHT CARD */}
      <div className="w-full max-w-5xl h-[85vh] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 text-white flex flex-col">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiBook className="text-blue-400" />
            Manage Course Chapters
          </h1>
          <p className="text-white/70 mt-1">
            Add, review, and manage course chapters
          </p>
        </div>

        {/* ADD CHAPTER */}
        <div className="mb-6 bg-white/10 border border-white/20 rounded-2xl p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiPlusCircle className="text-green-400" />
            Add New Chapter
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm mb-1 text-white/80">
                <FiFileText />
                Chapter Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Introduction to HTML"
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30 placeholder-white/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm mb-1 text-white/80">
                <FiFileText />
                Chapter Content
              </label>
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Explain the topic briefly"
                className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30 placeholder-white/50 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={addChapter}
            disabled={submitting}
            className={`mt-4 w-full py-2.5 rounded-xl font-medium transition ${
              submitting
                ? "bg-gray-400/40 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {submitting ? "Adding Chapter..." : "Add Chapter"}
          </button>
        </div>

        {/* SCROLLABLE CHAPTER LIST */}
        <div className="flex-1 overflow-y-auto pr-2">
          <h2 className="text-xl font-semibold mb-4">
            Existing Chapters
          </h2>

          {chapters.length === 0 ? (
            <p className="text-white/60">No chapters added yet.</p>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="bg-white/10 border border-white/20 rounded-2xl p-5 flex justify-between gap-4"
                >
                  <div>
                    <p className="text-xs text-white/50 mb-1">
                      Chapter {index + 1}
                    </p>
                    <h3 className="text-lg font-semibold">
                      {chapter.title}
                    </h3>
                    <p className="text-sm text-white/70 mt-1">
                      {chapter.content}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteChapter(chapter.id)}
                    className="h-fit flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 transition text-sm"
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="pt-4 text-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white underline"
          >
            <FiArrowLeft />
            Back to Courses
          </button>
        </div>
      </div>
    </div>
  );
}
