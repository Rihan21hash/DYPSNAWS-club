import { redirect } from "next/navigation";

// The middleware redirects /admin based on session state:
// - Authenticated → /admin/dashboard
// - Not authenticated → /admin/login
// This page is a fallback that should never be reached normally.
export default function AdminPage() {
  redirect("/admin/login");
}
