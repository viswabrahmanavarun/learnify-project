"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiLogOut,
  FiShield,
} from "react-icons/fi";

/* =========================
   TYPES
========================= */
interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MENTOR" | "STUDENT";
  approved: boolean;
}

/* =========================
   ADMIN DASHBOARD
========================= */
export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     AUTH CHECK (ADMIN)
  ========================= */
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
      router.replace("/auth/login");
    }
  }, [router]);

  /* =========================
     FETCH USERS
  ========================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users");
        setUsers(res.data || []);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /* =========================
     APPROVE MENTOR
  ========================= */
  const approveMentor = async (userId: number) => {
    try {
      await api.patch(`/admin/approve-mentor/${userId}`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, approved: true } : u
        )
      );
    } catch {
      alert("Failed to approve mentor");
    }
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white">
        <p className="animate-pulse text-lg">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] px-6">
      <div className="w-full max-w-6xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 text-white">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <FiShield className="text-blue-400" />
              Admin Dashboard
            </h1>
            <p className="text-white/70 mt-2">
              Manage users and approve mentors
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              router.replace("/auth/login");
            }}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-600 transition text-sm"
          >
            <FiLogOut />
            Logout
          </button>
        </div>

        {/* USERS TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-white/20">
          <table className="w-full text-sm">
            <thead className="bg-white/10 text-white/80">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    {user.role}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {user.role === "MENTOR" ? (
                      user.approved ? (
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <FiCheckCircle />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-400">
                          <FiClock />
                          Pending
                        </span>
                      )
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    {user.role === "MENTOR" && !user.approved ? (
                      <button
                        onClick={() => approveMentor(user.id)}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 transition text-xs font-medium"
                      >
                        <FiUsers />
                        Approve
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
