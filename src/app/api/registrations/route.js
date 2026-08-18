import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAuthUser, requireAdmin } from "@/lib/auth";

// POST: Register current user for an event
export async function POST(request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { eventSlug, userName, formData } = await request.json();

    if (!eventSlug) {
      return NextResponse.json({ error: "Event slug is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Build the insert object — include form_data only if we have data
    const insertObj = {
      event_slug: eventSlug,
      user_id: user.id,
      user_email: user.email,
      user_name: userName || user.user_metadata?.full_name || user.user_metadata?.name || user.email,
    };

    // Try with form_data first, fall back to without if the column doesn't exist
    if (formData && Object.keys(formData).length > 0) {
      insertObj.form_data = formData;
    }

    let { data, error } = await supabase
      .from("event_registrations")
      .insert(insertObj)
      .select()
      .single();

    // If form_data column doesn't exist, retry without it
    if (error && error.message?.includes("form_data")) {
      delete insertObj.form_data;
      const retry = await supabase
        .from("event_registrations")
        .insert(insertObj)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "Already registered for this event" }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

// GET: List registrations (admin: all; user: own)
export async function GET(request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventSlug = searchParams.get("eventSlug");

  const supabase = await createClient();
  const admin = await requireAdmin();

  let query = supabase.from("event_registrations").select("*");

  if (eventSlug) {
    query = query.eq("event_slug", eventSlug);
  }

  if (!admin) {
    query = query.eq("user_id", user.id);
  }

  query = query.order("registered_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
