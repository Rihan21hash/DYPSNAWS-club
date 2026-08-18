import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { readData, writeData } from "@/lib/dataStore";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured");

  let dbEvents = [];
  try {
    let query = supabaseAdmin.from("events").select("*").order("created_at", { ascending: false });
    if (featured === "true") {
      query = query.eq("featured", true);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      dbEvents = data.map((e) => ({
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
      }));
    }
  } catch {
    // fallback
  }

  if (dbEvents.length > 0) {
    return NextResponse.json(dbEvents);
  }

  // Fallback to local data/events.json
  const localEvents = readData("events") || [];
  const filtered = featured === "true"
    ? localEvents.filter((e) => e.featured !== false)
    : localEvents;

  return NextResponse.json(filtered);
}

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const event = await request.json();

    if (!event.slug) {
      event.slug = (event.title || "event")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    const registrationType = event.registrationType || (event.externalRegistrationUrl ? "redirect" : "form");

    const eventRecord = {
      slug: event.slug,
      title: event.title,
      date: event.date,
      desc: event.desc || event.description || "",
      type: event.type || "Workshop",
      color: event.color || "#8B5CF6",
      location: event.location || "DYPSN Campus",
      capacity: event.capacity || 50,
      status: event.status || "upcoming",
      featured: event.featured !== false,
      registrationType,
      externalRegistrationUrl: event.externalRegistrationUrl || "",
      prerequisites: event.prerequisites || [],
      schedule: event.schedule || [],
      speakers: event.speakers || [],
      formFields: event.formFields || [],
      images: event.images || [],
      videos: event.videos || [],
    };

    // 1. Try saving to Supabase
    try {
      await supabaseAdmin.from("events").insert({
        slug: eventRecord.slug,
        title: eventRecord.title,
        description: eventRecord.desc,
        event_date: eventRecord.date,
        location: eventRecord.location,
        capacity: eventRecord.capacity,
        status: eventRecord.status.toLowerCase(),
        registration_type: registrationType,
        external_registration_url: eventRecord.externalRegistrationUrl,
        form_fields: eventRecord.formFields,
      });
    } catch (e) {
      console.warn("Supabase event insert warning:", e?.message);
    }

    // 2. Save to local data/events.json
    try {
      const localEvents = readData("events") || [];
      const idx = localEvents.findIndex((e) => e.slug === eventRecord.slug);
      if (idx >= 0) {
        localEvents[idx] = eventRecord;
      } else {
        localEvents.unshift(eventRecord);
      }
      writeData("events", localEvents);
    } catch (e) {
      console.warn("Local events write warning:", e?.message);
    }

    return NextResponse.json(eventRecord, { status: 201 });
  } catch (err) {
    console.error("Error creating event:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
