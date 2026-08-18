import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";
import { readData, writeData } from "@/lib/dataStore";

export async function GET(request, { params }) {
  const { id } = await params;

  // Try Supabase first
  try {
    const { data: quiz, error } = await supabaseAdmin
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && quiz) {
      let questions = [];
      try {
        const { data: qData } = await supabaseAdmin
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", id)
          .order("order_num", { ascending: true });
        questions = qData || [];
      } catch {
        // ignore
      }

      return NextResponse.json({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        status: quiz.status,
        timeLimitSeconds: quiz.time_limit_seconds,
        color: quiz.color,
        isExternalRedirect: quiz.is_external_redirect ?? false,
        externalUrl: quiz.external_url || "",
        createdAt: quiz.created_at,
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctIndex: q.correct_index,
          points: q.points,
        })),
      });
    }
  } catch {
    // fallback
  }

  // Fallback to local data/quizzes.json
  const localQuizzes = readData("quizzes") || [];
  const found = localQuizzes.find((q) => q.id === id);

  if (found) {
    return NextResponse.json(found);
  }

  return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
}

export async function PUT(request, { params }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const isExternalRedirect = Boolean(body.isExternalRedirect || body.externalUrl);

    // 1. Try Supabase update
    try {
      const row = {};
      if (body.title !== undefined) row.title = body.title;
      if (body.description !== undefined) row.description = body.description;
      if (body.timeLimitSeconds !== undefined) row.time_limit_seconds = body.timeLimitSeconds;
      if (body.color !== undefined) row.color = body.color;
      if (body.status !== undefined) row.status = body.status;
      if (body.isExternalRedirect !== undefined) row.is_external_redirect = body.isExternalRedirect;
      if (body.externalUrl !== undefined) row.external_url = body.externalUrl;

      await supabaseAdmin.from("quizzes").update(row).eq("id", id);

      if (!isExternalRedirect && body.questions !== undefined && body.questions.length > 0) {
        await supabaseAdmin.from("quiz_questions").delete().eq("quiz_id", id);
        const questionRows = body.questions.map((q, i) => ({
          quiz_id: id,
          question: q.question,
          options: q.options,
          correct_index: q.correctIndex,
          points: q.points || 10,
          order_num: i,
        }));
        await supabaseAdmin.from("quiz_questions").insert(questionRows);
      }
    } catch (e) {
      console.warn("Supabase quiz update warning:", e?.message);
    }

    // 2. Update local data/quizzes.json
    const localQuizzes = readData("quizzes") || [];
    const idx = localQuizzes.findIndex((q) => q.id === id);
    if (idx >= 0) {
      localQuizzes[idx] = {
        ...localQuizzes[idx],
        ...body,
        isExternalRedirect,
        externalUrl: body.externalUrl || "",
      };
      writeData("quizzes", localQuizzes);
      return NextResponse.json(localQuizzes[idx]);
    }

    return NextResponse.json({ id, ...body });
  } catch (err) {
    console.error("Error updating quiz:", err);
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
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
      await supabaseAdmin.from("quizzes").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase quiz delete warning:", e?.message);
    }

    // 2. Delete from local data/quizzes.json
    const localQuizzes = readData("quizzes") || [];
    const filtered = localQuizzes.filter((q) => q.id !== id);
    writeData("quizzes", filtered);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}
