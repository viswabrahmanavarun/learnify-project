// frontend/app/page.tsx
import { redirect } from "next/navigation";

/**
 * Root page
 * Redirects users to login page
 */
export default function HomePage(): never {
  redirect("/auth/login");
}
