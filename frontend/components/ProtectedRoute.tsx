"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getUserFromToken,
  isAuthenticated,
  UserRole,
} from "@/lib/auth";

/* =========================
   PROTECTED ROUTE
========================= */
export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) {
  const router = useRouter();

  useEffect(() => {
    // Not logged in
    if (!isAuthenticated()) {
      router.replace("/auth/login");
      return;
    }

    const user = getUserFromToken();

    // Token invalid / expired
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Role not allowed
    if (!allowedRoles.includes(user.role)) {
      router.replace("/auth/login");
      return;
    }
  }, [allowedRoles, router]);

  return <>{children}</>;
}
