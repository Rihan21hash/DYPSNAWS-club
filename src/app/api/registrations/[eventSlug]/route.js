import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth";

// GET: Check if current user is registered for this event
export async function GET(request, { params }) {
  const { eventSlug } = await params;
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ registered: false, authenticated: false });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("event_slug", eventSlug)
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    registered: !!data,
    authenticated: true,
    registration: data || null,
  });
}

// DELETE: Cancel registration
export async function DELETE(request, { params }) {
  const { eventSlug } = await params;
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("event_registrations")
    .delete()
    .eq("event_slug", eventSlug)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
