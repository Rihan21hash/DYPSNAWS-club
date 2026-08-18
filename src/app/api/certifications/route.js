import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { readData, writeData } from "@/lib/dataStore";

export async function GET() {
  let dbCerts = [];
  try {
    const { data, error } = await supabaseAdmin
      .from("certifications")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      dbCerts = data.map((c) => ({
        id: c.id,
        name: c.name || c.title,
        code: c.code || "",
        level: c.level || "Foundational",
        tier: c.level || c.tier || "Foundational",
        color: c.color || "#A855F7",
        description: c.description || "",
        duration: c.duration || "90 mins",
        questions: c.questions ? (typeof c.questions === "number" ? `${c.questions} questions` : c.questions) : "65 questions",
        passingScore: c.passing_score || c.passingScore || "700 / 1000",
        topics: Array.isArray(c.topics) ? c.topics : [],
        image: c.image || c.image_url || "",
      }));
    }
  } catch {
    // fallback
  }

  if (dbCerts.length > 0) {
    return NextResponse.json(dbCerts);
  }

  // Fallback to local data/certifications.json
  const localCerts = readData("certifications") || [];
  return NextResponse.json(localCerts);
}

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cert = await request.json();

    const id = cert.id || (cert.name || "cert")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const certRecord = {
      id,
      name: cert.name || "",
      code: cert.code || "",
      level: cert.level || "Foundational",
      tier: cert.level || cert.tier || "Foundational",
      color: cert.color || "#A855F7",
      description: cert.description || "",
      duration: cert.duration || "90 mins",
      questions: cert.questions || "65 questions",
      passingScore: cert.passingScore || "700 / 1000",
      topics: Array.isArray(cert.topics) ? cert.topics : [],
      image: cert.image || "",
    };

    // 1. Try Supabase insert
    try {
      await supabaseAdmin.from("certifications").insert({
        id: certRecord.id,
        name: certRecord.name,
        code: certRecord.code,
        level: certRecord.level,
        color: certRecord.color,
        description: certRecord.description,
        duration: certRecord.duration,
        questions: parseInt(certRecord.questions, 10) || 65,
        passing_score: certRecord.passingScore,
        topics: certRecord.topics,
        image: certRecord.image,
      });
    } catch (e) {
      console.warn("Supabase certification insert warning:", e?.message);
    }

    // 2. Save to local data/certifications.json
    try {
      const localCerts = readData("certifications") || [];
      const idx = localCerts.findIndex((c) => c.id === id);
      if (idx >= 0) {
        localCerts[idx] = certRecord;
      } else {
        localCerts.push(certRecord);
      }
      writeData("certifications", localCerts);
    } catch (e) {
      console.warn("Local certifications write warning:", e?.message);
    }

    return NextResponse.json(certRecord, { status: 201 });
  } catch (err) {
    console.error("Error creating certification:", err);
    return NextResponse.json({ error: "Failed to create certification" }, { status: 500 });
  }
}
