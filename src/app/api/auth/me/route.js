import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminById } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Role-based admin check via DB (with fallback to metadata / ADMIN_EMAIL)
  const adminOk = await isAdminById(user.id, user.email, user.user_metadata);

  return NextResponse.json({
    authenticated: true,
    id: user.id,
    email: user.email,
    isAdmin: adminOk,
    role: adminOk ? "admin" : "user",
    name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User",
    avatar: user.user_metadata?.avatar_url || null,
  });
}
