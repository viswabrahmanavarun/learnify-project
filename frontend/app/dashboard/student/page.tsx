"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FiUser,
  FiBookOpen,
  FiCheckCircle,
  FiAward,
  FiLogOut,
  FiLayers,
  FiFileText,
} from "react-icons/fi";

/* =========================
   TYPES
========================= */
type Course = {
  id: number;
  completed?: boolean;
};

type Certificate = {
  id: number;
};

/* =========================
   STUDENT DASHBOARD
========================= */
export default function StudentDashboard() {
  const router = useRouter();

  const [enrolledCount, setEnrolledCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [certificateCount, setCertificateCount] =
    useState(0);
  const [loading, setLoading] = useState(true);

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

    const fetchDashboardData = async () => {
      try {
        const [enrolledRes, certificateRes] =
          await Promise.all([
            api.get("/courses/enrolled"),
            api.get("/certificates/my"),
          ]);

        const enrolledCourses: Course[] =
          enrolledRes.data || [];
        const certificates: Certificate[] =
          certificateRes.data || [];

        setEnrolledCount(enrolledCourses.length);

        setCompletedCount(
          enrolledCourses.filter(
            (c) => c.completed === true
          ).length
        );

        setCertificateCount(certificates.length);
      } catch (error) {
        console.error(
          "Failed to load dashboard data",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

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
          Loading dashboard...
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
      <div className="relative w-full max-w-6xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 text-white">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <FiUser className="text-blue-400" />
            Student Dashboard
          </h1>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 transition text-sm"
          >
            <FiLogOut />
            Logout
          </button>
        </div>

        <p className="text-white/70 mb-12">
          Track your progress, continue courses, and
          download certificates
        </p>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <StatCard
            icon={<FiBookOpen />}
            label="Enrolled Courses"
            value={enrolledCount}
          />
          <StatCard
            icon={<FiCheckCircle />}
            label="Completed Courses"
            value={completedCount}
          />
          <StatCard
            icon={<FiAward />}
            label="Certificates"
            value={certificateCount}
          />
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ActionCard
            icon={<FiLayers />}
            title="Browse Courses"
            desc="Explore all available courses"
            onClick={() =>
              router.push(
                "/dashboard/student/courses"
              )
            }
          />

          <ActionCard
            icon={<FiBookOpen />}
            title="My Enrolled Courses"
            desc="Continue where you left off"
            onClick={() =>
              router.push(
                "/dashboard/student/enrolled"
              )
            }
          />

          <ActionCard
            icon={<FiFileText />}
            title="Certificates"
            desc="Download earned certificates"
            onClick={() =>
              router.push(
                "/dashboard/student/certificates"
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

/* =========================
   STAT CARD
========================= */
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-6 flex items-center gap-4">
      <div className="text-3xl text-blue-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-white/70">
          {label}
        </p>
        <p className="text-2xl font-bold">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================
   ACTION CARD
========================= */
function ActionCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white/10 border border-white/20 rounded-2xl p-6 cursor-pointer hover:bg-white/15 transition-all hover:scale-[1.02]"
    >
      <div className="text-4xl text-green-400 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>
      <p className="text-sm text-white/70 mb-4">
        {desc}
      </p>
      <span className="text-sm font-medium text-blue-400">
        Open →
      </span>
    </div>
  );
}
