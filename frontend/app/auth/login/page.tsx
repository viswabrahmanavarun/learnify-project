"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     LOGIN HANDLER
  ========================= */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:4000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      /**
       * EXPECTED RESPONSE
       * {
       *   token: string,
       *   role: "STUDENT" | "MENTOR" | "ADMIN",
       *   userId: number
       * }
       */
      const { token, role, userId } = data;

      if (!token || !role || !userId) {
        setError("Invalid login response");
        return;
      }

      /* STORE AUTH DATA */
      document.cookie = `token=${token}; path=/`;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", String(userId));

      /* ROLE BASED REDIRECT */
      if (role === "STUDENT") {
        router.replace("/dashboard/student");
      } else if (role === "MENTOR") {
        router.replace("/dashboard/mentor");
      } else if (role === "ADMIN") {
        router.replace("/dashboard/admin");
      } else {
        setError("Unknown user role");
      }
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
          Sign in to continue your learning journey
        </p>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white/80">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-400 text-sm text-center">
              {error}
            </p>
          )}

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
            <FiLogIn />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-white/70">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/auth/register")}
            className="text-blue-400 hover:underline cursor-pointer"
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
}
