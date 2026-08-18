import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import supabaseAdmin from "@/lib/supabaseAdmin";

// POST — Start a quiz attempt
export async function POST(request, { params }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to take quizzes" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Check quiz exists and is live
    const { data: quiz } = await supabaseAdmin
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .single();

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (quiz.status !== "live") {
      return NextResponse.json({ error: "This quiz is not currently live" }, { status: 400 });
    }

    // Check if user already has an attempt
    const { data: existing } = await supabaseAdmin
      .from("quiz_attempts")
      .select("*")
      .eq("quiz_id", id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      // Return existing attempt with questions (without correct answers)
      const { data: questions } = await supabaseAdmin
        .from("quiz_questions")
        .select("id, question, options, points, order_num")
        .eq("quiz_id", id)
        .order("order_num", { ascending: true });

      // Get already answered question IDs
      const { data: answers } = await supabaseAdmin
        .from("quiz_answers")
        .select("question_id, selected_index, is_correct")
        .eq("attempt_id", existing.id);

      return NextResponse.json({
        attemptId: existing.id,
        alreadyStarted: true,
        completed: existing.completed,
        score: existing.score,
        questions: questions || [],
        answers: answers || [],
      });
    }

    // Create new attempt
    const { data: attempt, error } = await supabaseAdmin
      .from("quiz_attempts")
      .insert({
        quiz_id: id,
        user_id: user.id,
        user_email: user.email,
        user_name: body.userName || user.email.split("@")[0],
        total_questions: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating attempt:", error);
      return NextResponse.json({ error: "Failed to start quiz" }, { status: 500 });
    }

    // Get questions WITHOUT correct_index
    const { data: questions } = await supabaseAdmin
      .from("quiz_questions")
      .select("id, question, options, points, order_num")
      .eq("quiz_id", id)
      .order("order_num", { ascending: true });

    // Update total questions count on the attempt
    await supabaseAdmin
      .from("quiz_attempts")
      .update({ total_questions: questions?.length || 0 })
      .eq("id", attempt.id);

    return NextResponse.json({
      attemptId: attempt.id,
      alreadyStarted: false,
      completed: false,
      score: 0,
      questions: questions || [],
      answers: [],
    });
  } catch (err) {
    console.error("Error starting quiz:", err);
    return NextResponse.json({ error: "Failed to start quiz" }, { status: 500 });
  }
}

// PUT — Submit an answer for a question
export async function PUT(request, { params }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { attemptId, questionId, selectedIndex } = body;

    // Validate attempt belongs to user
    const { data: attempt } = await supabaseAdmin
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .single();

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.completed) {
      return NextResponse.json({ error: "Quiz already completed" }, { status: 400 });
    }

    // Check if already answered this question
    const { data: existingAnswer } = await supabaseAdmin
      .from("quiz_answers")
      .select("id")
      .eq("attempt_id", attemptId)
      .eq("question_id", questionId)
      .single();

    if (existingAnswer) {
      return NextResponse.json({ error: "Already answered this question" }, { status: 400 });
    }

    // Get the question to check correctness
    const { data: question } = await supabaseAdmin
      .from("quiz_questions")
      .select("correct_index, points")
      .eq("id", questionId)
      .single();

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const isCorrect = selectedIndex === question.correct_index;

    // Record the answer
    await supabaseAdmin.from("quiz_answers").insert({
      attempt_id: attemptId,
      question_id: questionId,
      selected_index: selectedIndex,
      is_correct: isCorrect,
    });

    // Update score on the attempt
    const newScore = attempt.score + (isCorrect ? question.points : 0);
    
    // Count total answered
    const { count: answeredCount } = await supabaseAdmin
      .from("quiz_answers")
      .select("*", { count: "exact", head: true })
      .eq("attempt_id", attemptId);

    const isComplete = answeredCount >= attempt.total_questions;

    const updateData = { score: newScore };
    if (isComplete) {
      updateData.completed = true;
      updateData.completed_at = new Date().toISOString();
    }

    await supabaseAdmin
      .from("quiz_attempts")
      .update(updateData)
      .eq("id", attemptId);

    return NextResponse.json({
      isCorrect,
      correctIndex: question.correct_index,
      score: newScore,
      completed: isComplete,
      points: isCorrect ? question.points : 0,
    });
  } catch (err) {
    console.error("Error submitting answer:", err);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
