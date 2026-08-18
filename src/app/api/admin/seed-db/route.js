import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { readData } from "@/lib/dataStore";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    events: 0,
    certifications: 0,
    team: 0,
    quizzes: 0,
    errors: [],
  };

  // 1. Sync Events
  try {
    const events = readData("events") || [];
    for (const e of events) {
      const { error } = await supabaseAdmin.from("events").upsert({
        slug: e.slug,
        title: e.title,
        description: e.desc || e.description,
        event_date: e.date,
        location: e.location,
        capacity: e.capacity || 50,
        status: (e.status || "upcoming").toLowerCase(),
        form_fields: e.formFields || [],
      }, { onConflict: "slug" });
      if (!error) results.events++;
      else results.errors.push(`Event (${e.slug}): ${error.message}`);
    }
  } catch (err) {
    results.errors.push(`Events sync: ${err.message}`);
  }

  // 2. Sync Certifications
  try {
    const certs = readData("certifications") || [];
    for (const c of certs) {
      const { error } = await supabaseAdmin.from("certifications").upsert({
        id: c.id,
        name: c.name,
        code: c.code,
        level: c.level || c.tier || "Foundational",
        color: c.color || "#A855F7",
        description: c.description,
        duration: c.duration,
        questions: c.questions,
        passing_score: c.passingScore,
        topics: c.topics || [],
        image: c.image || "",
      }, { onConflict: "id" });
      if (!error) results.certifications++;
      else results.errors.push(`Cert (${c.id}): ${error.message}`);
    }
  } catch (err) {
    results.errors.push(`Certifications sync: ${err.message}`);
  }

  // 3. Sync Team Members
  try {
    const teamData = readData("team");
    const allMembers = [
      ...(teamData.members || []).map((m) => ({ ...m, member_type: "core" })),
      ...(teamData.contributors || []).map((m) => ({ ...m, member_type: "contributor" })),
    ];
    for (const m of allMembers) {
      const { error } = await supabaseAdmin.from("team_members").upsert({
        id: m.id,
        name: m.name,
        role: m.role,
        tagline: m.tagline || "",
        avatar: m.avatar || "",
        color: m.color || "#A855F7",
        bio: m.bio || "",
        member_type: m.member_type || "core",
        certifications: m.certifications || [],
        social: m.social || {},
      }, { onConflict: "id" });
      if (!error) results.team++;
      else results.errors.push(`Team (${m.id}): ${error.message}`);
    }
  } catch (err) {
    results.errors.push(`Team sync: ${err.message}`);
  }

  // 4. Sync Quizzes
  try {
    const quizzes = readData("quizzes") || [];
    for (const q of quizzes) {
      const { error } = await supabaseAdmin.from("quizzes").upsert({
        id: q.id,
        title: q.title,
        description: q.description,
        status: q.status || "draft",
        time_limit_seconds: q.timeLimitSeconds || 30,
        color: q.color || "#A855F7",
      }, { onConflict: "id" });
      if (!error) results.quizzes++;
      else results.errors.push(`Quiz (${q.id}): ${error.message}`);
    }
  } catch (err) {
    results.errors.push(`Quizzes sync: ${err.message}`);
  }

  return NextResponse.json({ success: true, results });
}
