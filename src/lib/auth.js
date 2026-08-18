import { createClient } from "@/lib/supabase/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

/**
 * Check if a user ID has admin role via DB lookup.
 * Falls back to user metadata or ADMIN_EMAIL if the profiles table has not been migrated yet.
 */
export async function isAdminById(userId, userEmail = null, userMetadata = null) {
  if (!userId) return false;
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!error && data) {
      return data.role === "admin";
    }
  } catch {
    // If profiles table does not exist or query fails, fall back to email / metadata
  }

  const adminEmail = process.env.ADMIN_EMAIL || "captain@dypsn.com";
  if (userEmail && userEmail.toLowerCase() === adminEmail.toLowerCase()) {
    return true;
  }
  if (userMetadata?.role === "admin") {
    return true;
  }

  return false;
}

/**
 * Get authenticated user from Supabase session.
 * Returns the user object or null.
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Get authenticated user AND verify they are admin.
 * Returns the user object if admin, or null.
 */
export async function requireAdmin() {
  const user = await getAuthUser();
  if (!user) return null;
  const adminOk = await isAdminById(user.id, user.email, user.user_metadata);
  if (!adminOk) return null;
  return user;
}

/**
 * Legacy email-based check kept for backward compatibility.
 */
export function isAdminEmail(email) {
  const adminEmail = process.env.ADMIN_EMAIL || "captain@dypsn.com";
  return email && email.toLowerCase() === adminEmail.toLowerCase();
}
