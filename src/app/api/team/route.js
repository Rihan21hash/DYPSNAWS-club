import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { readData, writeData } from "@/lib/dataStore";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const memberType = type === "contributor" ? "contributor" : "core";

  let dbMembers = [];
  try {
    const { data, error } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("member_type", memberType)
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      dbMembers = data.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        tagline: m.tagline || "",
        avatar: m.avatar || "",
        color: m.color || "#A855F7",
        bio: m.bio || "",
        certifications: Array.isArray(m.certifications) ? m.certifications : [],
        social: typeof m.social === "object" && m.social !== null ? m.social : {},
      }));
    }
  } catch {
    // Fallback to local store if Supabase table is not yet migrated
  }

  if (dbMembers.length > 0) {
    return NextResponse.json(dbMembers);
  }

  // Fallback to local data/team.json
  const localData = readData("team");
  const localList = memberType === "contributor"
    ? (localData.contributors || [])
    : (localData.members || []);

  return NextResponse.json(localList);
}

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const isContributor = body._type === "contributor";
    delete body._type;

    const baseSlug = (body.name || "member")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const id = body.id || `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const memberType = isContributor ? "contributor" : "core";

    const memberObject = {
      id,
      name: body.name || "",
      role: body.role || "",
      tagline: body.tagline || "",
      avatar: body.avatar || (body.name ? body.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "MB"),
      color: body.color || "#A855F7",
      bio: body.bio || "",
      member_type: memberType,
      certifications: Array.isArray(body.certifications) ? body.certifications.filter(Boolean) : [],
      social: typeof body.social === "object" && body.social !== null ? body.social : {},
    };

    // 1. Try saving to Supabase
    try {
      await supabaseAdmin.from("team_members").insert(memberObject);
    } catch (e) {
      console.warn("Supabase insert warning (falling back to local store):", e?.message);
    }

    // 2. Also save to local data/team.json
    try {
      const localData = readData("team");
      if (isContributor) {
        if (!localData.contributors) localData.contributors = [];
        localData.contributors.push(memberObject);
      } else {
        if (!localData.members) localData.members = [];
        localData.members.push(memberObject);
      }
      writeData("team", localData);
    } catch (e) {
      console.warn("Local data store write warning:", e?.message);
    }

    return NextResponse.json(memberObject, { status: 201 });
  } catch (err) {
    console.error("Error creating member:", err);
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 });
  }
}
