import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { readData, writeData } from "@/lib/dataStore";

function mapEvent(e) {
  return {
    slug: e.slug,
    title: e.title,
    date: e.date || e.event_date,
    desc: e.description || e.desc,
    type: e.type || "Workshop",
    color: e.color || "#8B5CF6",
    location: e.location || "DYPSN Campus",
    capacity: e.capacity || 50,
    status: e.status || "upcoming",
    featured: e.featured,
    registrationType: e.registration_type || e.registrationType || (e.external_registration_url ? "redirect" : "form"),
    externalRegistrationUrl: e.external_registration_url || e.externalRegistrationUrl || "",
    prerequisites: e.prerequisites || [],
    schedule: e.schedule || [],
    speakers: e.speakers || [],
    formFields: e.form_fields || e.formFields || [],
    images: e.images || [],
    videos: e.videos || [],
  };
}

export async function GET(request, { params }) {
  const { slug } = await params;

  // Try Supabase first
  try {
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!error && data) {
      return NextResponse.json(mapEvent(data));
    }
  } catch {
    // fallback
  }

  // Fallback to local data/events.json
  const localEvents = readData("events") || [];
  const found = localEvents.find((e) => e.slug === slug);

  if (found) {
    return NextResponse.json(mapEvent(found));
  }

  return NextResponse.json({ error: "Event not found" }, { status: 404 });
}

export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const updates = await request.json();

    const registrationType = updates.registrationType || (updates.externalRegistrationUrl ? "redirect" : "form");

    // 1. Try Supabase update
    try {
      await supabaseAdmin
        .from("events")
        .update({
          title: updates.title,
          description: updates.desc || updates.description,
          event_date: updates.date,
          location: updates.location,
          capacity: updates.capacity,
          status: updates.status ? updates.status.toLowerCase() : undefined,
          registration_type: registrationType,
          external_registration_url: updates.externalRegistrationUrl,
          form_fields: updates.formFields,
        })
        .eq("slug", slug);
    } catch (e) {
      console.warn("Supabase event update warning:", e?.message);
    }

    // 2. Update local data/events.json
    const localEvents = readData("events") || [];
    const idx = localEvents.findIndex((e) => e.slug === slug);
    if (idx >= 0) {
      localEvents[idx] = {
        ...localEvents[idx],
        ...updates,
        registrationType,
        externalRegistrationUrl: updates.externalRegistrationUrl || "",
      };
      writeData("events", localEvents);
      return NextResponse.json(mapEvent(localEvents[idx]));
    }

    return NextResponse.json({ slug, ...updates });
  } catch (err) {
    console.error("Error updating event:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;

    // 1. Try Supabase delete
    try {
      await supabaseAdmin.from("events").delete().eq("slug", slug);
    } catch (e) {
      console.warn("Supabase event delete warning:", e?.message);
    }

    // 2. Delete from local data/events.json
    const localEvents = readData("events") || [];
    const filtered = localEvents.filter((e) => e.slug !== slug);
    writeData("events", filtered);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
