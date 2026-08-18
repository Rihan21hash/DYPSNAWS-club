import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminById } from "@/lib/auth";

// Legacy server-side login endpoint — kept for backward compatibility.
// New login is handled client-side via Supabase Auth in AdminLoginClient.jsx.
export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Role-based admin check (not email string)
    const adminOk = await isAdminById(data.user.id);
    if (!adminOk) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "This account is not authorized for admin access" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      email: data.user.email,
    });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
