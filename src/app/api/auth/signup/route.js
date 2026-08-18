import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const { email, password, metadata } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "captain@dypsn.com").toLowerCase();
    const isTargetAdmin = email.toLowerCase() === adminEmail;
    const userRole = isTargetAdmin ? "admin" : "user";

    const userMetadata = {
      ...(metadata || {}),
      role: userRole,
    };

    // 1. Create or update user with auto-confirmation
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: userMetadata,
      });

    if (createError) {
      // If user already exists, update their password and confirm them
      if (createError.message.toLowerCase().includes("already") || createError.status === 422) {
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existing = users?.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
            user_metadata: userMetadata,
          });
          return NextResponse.json({ success: true, user: existing });
        }
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 2. Try inserting/updating profiles table if it exists
    try {
      if (userData?.user) {
        await supabaseAdmin.from("profiles").upsert({
          id: userData.user.id,
          email: userData.user.email,
          full_name: metadata?.full_name || "",
          admission_year: metadata?.admission_year || null,
          academic_year: metadata?.academic_year || null,
          role: userRole,
        });
      }
    } catch {
      // ignore if profiles table is not created yet
    }

    return NextResponse.json({ success: true, user: userData.user }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
