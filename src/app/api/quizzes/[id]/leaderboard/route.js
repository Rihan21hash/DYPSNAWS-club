import { NextResponse } from "next/server";
import supabaseAdmin from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("quiz_attempts")
    .select("id, user_name, user_email, score, total_questions, completed, completed_at, started_at")
    .eq("quiz_id", id)
    .order("score", { ascending: false })
    .order("completed_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json([]);
  }

  const leaderboard = (data || []).map((a, index) => ({
    rank: index + 1,
    userName: a.user_name,
    score: a.score,
    totalQuestions: a.total_questions,
    completed: a.completed,
    completedAt: a.completed_at,
  }));

  return NextResponse.json(leaderboard);
}
