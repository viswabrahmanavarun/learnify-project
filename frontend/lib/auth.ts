// frontend/lib/auth.ts

import {jwtDecode} from "jwt-decode";

/* =========================
   TYPES
========================= */
export type UserRole = "ADMIN" | "MENTOR" | "STUDENT";

interface DecodedToken {
  userId: string;
  role: UserRole;
  exp: number;
}

/* =========================
   SAVE AUTH
========================= */
export const saveAuth = (token: string) => {
  localStorage.setItem("token", token);
};

/* =========================
   LOGOUT
========================= */
export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/auth/login";
};

/* =========================
   GET TOKEN
========================= */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/* =========================
   DECODE TOKEN
========================= */
export const getUserFromToken = (): DecodedToken | null => {
  try {
    const token = getToken();
    if (!token) return null;

    const decoded = jwtDecode<DecodedToken>(token);

    // Token expired
    if (decoded.exp * 1000 < Date.now()) {
      logout();
      return null;
    }

    return decoded;
  } catch {
    logout();
    return null;
  }
};

/* =========================
   GET ROLE (SAFE)
========================= */
export const getRole = (): UserRole | null => {
  const user = getUserFromToken();
  return user?.role ?? null;
};

/* =========================
   AUTH CHECK
========================= */
export const isAuthenticated = (): boolean => {
  return !!getUserFromToken();
};
