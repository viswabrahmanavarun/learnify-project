"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiUser,
  FiMail,
  FiLock,
  FiUsers,
  FiUserPlus,
} from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "MENTOR">("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     REGISTER HANDLER
  ========================= */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint =
        role === "STUDENT"
          ? "http://localhost:4000/api/auth/register/student"
          : "http://localhost:4000/api/auth/register/mentor";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      router.push("/auth/login");
    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] flex items-center justify-center px-6">
      {/* GLASS CARD */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-10 text-white">

        {/* PROJECT TITLE */}
        <h1 className="text-4xl font-bold text-center tracking-wide">
          Learnify
        </h1>

        <p className="text-white/60 text-center mb-8 mt-2">
          Create your account and start learning today
        </p>

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-6">
          {/* ERROR */}
          {error && (
            <p className="text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* ROLE */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">
              Register As
            </label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "STUDENT" | "MENTOR")
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="STUDENT">Student</option>
                <option value="MENTOR">Mentor</option>
              </select>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-400/40 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            <FiUserPlus />
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-white/70">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/auth/login")}
            className="text-blue-400 hover:underline cursor-pointer"
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}
