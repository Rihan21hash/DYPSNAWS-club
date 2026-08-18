import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { readData, writeData } from "@/lib/dataStore";

export async function GET(request, { params }) {
  const { id } = await params;

  // Try Supabase first
  try {
    const { data, error } = await supabaseAdmin
      .from("certifications")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      return NextResponse.json({
        id: data.id,
        name: data.name,
        code: data.code,
        level: data.level,
        tier: data.level || data.tier || "Foundational",
        color: data.color || "#A855F7",
        description: data.description,
        duration: data.duration,
        questions: data.questions,
        passingScore: data.passing_score || data.passingScore,
        topics: data.topics || [],
        image: data.image || "",
      });
    }
  } catch {
    // fallback
  }

  // Fallback to local data/certifications.json
  const localCerts = readData("certifications") || [];
  const found = localCerts.find((c) => c.id === id);

  if (found) {
    return NextResponse.json(found);
  }

  return NextResponse.json({ error: "Certification not found" }, { status: 404 });
}

export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const updates = await request.json();

    // 1. Try Supabase update
    try {
      await supabaseAdmin
        .from("certifications")
        .update({
          name: updates.name,
          code: updates.code,
          level: updates.level,
          color: updates.color,
          description: updates.description,
          duration: updates.duration,
          questions: typeof updates.questions === "string" ? parseInt(updates.questions, 10) : updates.questions,
          passing_score: updates.passingScore,
          topics: updates.topics,
          image: updates.image,
        })
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase certification update warning:", e?.message);
    }

    // 2. Update local data/certifications.json
    const localCerts = readData("certifications") || [];
    const idx = localCerts.findIndex((c) => c.id === id);
    if (idx >= 0) {
      localCerts[idx] = { ...localCerts[idx], ...updates, tier: updates.level || updates.tier || localCerts[idx].tier };
      writeData("certifications", localCerts);
      return NextResponse.json(localCerts[idx]);
    }

    return NextResponse.json({ id, ...updates });
  } catch (err) {
    console.error("Error updating certification:", err);
    return NextResponse.json({ error: "Failed to update certification" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // 1. Try Supabase delete
    try {
      await supabaseAdmin.from("certifications").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase certification delete warning:", e?.message);
    }

    // 2. Delete from local data/certifications.json
    const localCerts = readData("certifications") || [];
    const filtered = localCerts.filter((c) => c.id !== id);
    writeData("certifications", filtered);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 });
  }
}
