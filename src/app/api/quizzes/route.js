import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { readData, writeData } from "@/lib/dataStore";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let dbQuizzes = [];
  try {
    let query = supabaseAdmin
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (!error && Array.isArray(data) && data.length > 0) {
      dbQuizzes = await Promise.all(
        data.map(async (q) => {
          let questionCount = 0;
          try {
            const { count } = await supabaseAdmin
              .from("quiz_questions")
              .select("*", { count: "exact", head: true })
              .eq("quiz_id", q.id);
            questionCount = count || 0;
          } catch {
            // ignore
          }

          return {
            id: q.id,
            title: q.title,
            description: q.description,
            status: q.status,
            timeLimitSeconds: q.time_limit_seconds,
            color: q.color || "#A855F7",
            createdAt: q.created_at,
            isExternalRedirect: q.is_external_redirect ?? false,
            externalUrl: q.external_url || "",
            questionCount,
            attemptCount: 0,
          };
        })
      );
    }
  } catch {
    // fallback
  }

  if (dbQuizzes.length > 0) {
    return NextResponse.json(dbQuizzes);
  }

  // Fallback to local data/quizzes.json
  const localQuizzes = readData("quizzes") || [];
  const filtered = status ? localQuizzes.filter((q) => q.status === status) : localQuizzes;
  return NextResponse.json(filtered);
}

export async function POST(request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const quizId = body.id || `quiz-${Date.now().toString().slice(-6)}`;

    const isExternalRedirect = Boolean(body.isExternalRedirect || body.externalUrl);

    const quizRecord = {
      id: quizId,
      title: body.title,
      description: body.description || "",
      status: body.status || "live",
      timeLimitSeconds: body.timeLimitSeconds || 30,
      color: body.color || "#A855F7",
      isExternalRedirect,
      externalUrl: body.externalUrl || "",
      questions: body.questions || [],
      questionCount: body.questions?.length || 0,
      createdAt: new Date().toISOString(),
    };

    // 1. Try Supabase insert
    try {
      const { data: quiz } = await supabaseAdmin
        .from("quizzes")
        .insert({
          id: quizRecord.id,
          title: quizRecord.title,
          description: quizRecord.description,
          status: quizRecord.status,
          time_limit_seconds: quizRecord.timeLimitSeconds,
          color: quizRecord.color,
          is_external_redirect: isExternalRedirect,
          external_url: quizRecord.externalUrl,
        })
        .select()
        .single();

      if (quiz && !isExternalRedirect && body.questions && body.questions.length > 0) {
        const questionRows = body.questions.map((q, i) => ({
          quiz_id: quiz.id,
          question: q.question,
          options: q.options,
          correct_index: q.correctIndex,
          points: q.points || 10,
          order_num: i,
        }));
        await supabaseAdmin.from("quiz_questions").insert(questionRows);
      }
    } catch (e) {
      console.warn("Supabase quiz insert warning:", e?.message);
    }

    // 2. Save to local data/quizzes.json
    try {
      const localQuizzes = readData("quizzes") || [];
      const idx = localQuizzes.findIndex((q) => q.id === quizRecord.id);
      if (idx >= 0) {
        localQuizzes[idx] = quizRecord;
      } else {
        localQuizzes.unshift(quizRecord);
      }
      writeData("quizzes", localQuizzes);
    } catch (e) {
      console.warn("Local quizzes write warning:", e?.message);
    }

    return NextResponse.json(quizRecord, { status: 201 });
  } catch (err) {
    console.error("Error creating quiz:", err);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
