import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { readData, writeData } from "@/lib/dataStore";

export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const isContributor = type === "contributor";

  // Try Supabase first
  try {
    const { data, error } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      return NextResponse.json({
        id: data.id,
        name: data.name,
        role: data.role,
        tagline: data.tagline || "",
        avatar: data.avatar || "",
        color: data.color || "#A855F7",
        bio: data.bio || "",
        certifications: data.certifications || [],
        social: data.social || {},
      });
    }
  } catch {
    // Fallback to local
  }

  // Fallback to local data/team.json
  const localData = readData("team");
  const list = isContributor ? localData.contributors : localData.members;
  const found = (list || []).find((m) => m.id === id);

  if (found) {
    return NextResponse.json(found);
  }

  return NextResponse.json({ error: "Member not found" }, { status: 404 });
}

export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isContributor = searchParams.get("type") === "contributor";
    const updates = await request.json();
    delete updates._type;

    // 1. Try Supabase update
    try {
      await supabaseAdmin
        .from("team_members")
        .update(updates)
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase update warning:", e?.message);
    }

    // 2. Update local data/team.json
    const localData = readData("team");
    const listKey = isContributor ? "contributors" : "members";
    if (localData[listKey]) {
      localData[listKey] = localData[listKey].map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
      writeData("team", localData);
    }

    return NextResponse.json({ id, ...updates });
  } catch (err) {
    console.error("Error updating member:", err);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isContributor = searchParams.get("type") === "contributor";

    // 1. Try Supabase delete
    try {
      await supabaseAdmin
        .from("team_members")
        .delete()
        .eq("id", id);
    } catch (e) {
      console.warn("Supabase delete warning:", e?.message);
    }

    // 2. Delete from local data/team.json
    const localData = readData("team");
    const listKey = isContributor ? "contributors" : "members";
    if (localData[listKey]) {
      localData[listKey] = localData[listKey].filter((m) => m.id !== id);
      writeData("team", localData);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
