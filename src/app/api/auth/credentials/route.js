import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newEmail, newPassword } = await request.json();
    const updates = {};

    if (newEmail) updates.email = newEmail;
    if (newPassword) updates.password = newPassword;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const { error } = await supabase.auth.updateUser(updates);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Credentials updated" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update credentials" }, { status: 500 });
  }
}
