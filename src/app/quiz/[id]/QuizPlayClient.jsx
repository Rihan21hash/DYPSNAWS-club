"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import SmoothScroller from "@/components/SmoothScroller";
import Footer from "@/components/Footer";
import useRealtimeTable from "@/hooks/useRealtimeTable";
import { useAuth } from "@/context/AuthContext";

export default function QuizPlayClient() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id;
  const { user } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("intro"); // intro, playing, result
  const [userName, setUserName] = useState("");
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect, correctIndex }
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  // Prefill userName when user details load
  useEffect(() => {
    if (user && !userName) {
      setUserName(user.user_metadata?.full_name || user.email.split("@")[0]);
    }
  }, [user, userName]);

  // Live leaderboard
  const { data: leaderboard } = useRealtimeTable("quiz_attempts", `/api/quizzes/${quizId}/leaderboard`, {
    primaryKey: "rank",
  });

  // Fetch quiz details
  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setQuiz(data);
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (phase !== "playing" || feedback) return;
    if (timeLeft <= 0) {
      // Auto-submit with wrong answer (no selection)
      if (selectedIndex === null) {
        handleSubmitAnswer(-1);
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timerRef.current);
  }, [timeLeft, phase, feedback, selectedIndex]);

  const startQuiz = async () => {
    setError("");
    try {
      const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: userName || "Anonymous" }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to start quiz");
        return;
      }

      const data = await res.json();
      setAttemptId(data.attemptId);
      setQuestions(data.questions || []);
      setScore(data.score || 0);

      // If already completed, show results
      if (data.completed) {
        setPhase("result");
        // Set answers from already answered questions
        const answerMap = {};
        (data.answers || []).forEach((a) => { answerMap[a.question_id] = a; });
        setAnswers(answerMap);
        return;
      }

      // Find first unanswered question
      const answeredIds = new Set((data.answers || []).map((a) => a.question_id));
      const answerMap = {};
      (data.answers || []).forEach((a) => { answerMap[a.question_id] = a; });
      setAnswers(answerMap);

      const firstUnanswered = (data.questions || []).findIndex((q) => !answeredIds.has(q.id));
      setCurrentQ(firstUnanswered >= 0 ? firstUnanswered : 0);
      setTimeLeft(quiz?.timeLimitSeconds || 30);
      setPhase("playing");
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleSubmitAnswer = async (index) => {
    if (submitting || feedback) return;
    setSubmitting(true);
    setSelectedIndex(index);
    clearTimeout(timerRef.current);

    const question = questions[currentQ];

    try {
      const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionId: question.id,
          selectedIndex: index >= 0 ? index : -1,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ isCorrect: data.isCorrect, correctIndex: data.correctIndex });
        setScore(data.score);
        setAnswers((prev) => ({
          ...prev,
          [question.id]: { selected_index: index, is_correct: data.isCorrect },
        }));

        // Move to next question after delay
        setTimeout(() => {
          if (data.completed || currentQ >= questions.length - 1) {
            setPhase("result");
          } else {
            setCurrentQ((prev) => prev + 1);
            setSelectedIndex(null);
            setFeedback(null);
            setTimeLeft(quiz?.timeLimitSeconds || 30);
          }
        }, 1500);
      }
    } catch {
      setError("Failed to submit answer");
    }
    setSubmitting(false);
  };

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);
  const progressPercent = questions.length > 0 ? ((currentQ + (feedback ? 1 : 0)) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-purple-light/40 text-sm animate-pulse">Loading quiz...</div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => router.push("/quiz")} className="text-purple-light text-sm hover:underline">
            ← Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // INTRO PHASE
  if (phase === "intro") {
    return (
      <SmoothScroller>
        <div className="min-h-screen gradient-hero flex items-center justify-center px-6">
          <div className="glass-card p-8 md:p-12 max-w-lg w-full text-center" style={{ boxShadow: `0 0 60px ${quiz?.color || "#A855F7"}15` }}>
            {/* Quiz icon */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
              style={{
                background: `linear-gradient(135deg, ${quiz?.color || "#A855F7"}, ${quiz?.color || "#A855F7"}88)`,
                boxShadow: `0 0 40px ${quiz?.color || "#A855F7"}30`,
              }}
            >
              ⚡
            </div>

            <h1
              className="text-2xl md:text-3xl font-bold text-off-white mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {quiz?.title}
            </h1>
            <p className="text-sm text-off-white/40 mb-6">{quiz?.description}</p>

            {/* Stats */}
            <div className="flex justify-center gap-6 mb-8 text-xs text-off-white/30">
              <div className="text-center">
                <div className="text-xl font-bold text-off-white mb-1">{quiz?.questions?.length || 0}</div>
                Questions
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-off-white mb-1">{quiz?.timeLimitSeconds}s</div>
                Per Question
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-off-white mb-1">{totalPoints || 0}</div>
                Total Points
              </div>
            </div>

            {quiz?.status === "live" ? (
              <>
                {!user ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs text-off-white/40 mb-2 leading-relaxed">
                      Authentication is required to participate in this live quiz, save your score, and compete on the leaderboard.
                    </p>
                    <button
                      onClick={() => router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "")}`)}

                      className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${quiz?.color || "#A855F7"}, ${quiz?.color || "#A855F7"}CC)`,
                        color: "#fff",
                        fontFamily: "var(--font-display)",
                        letterSpacing: "0.1em",
                        boxShadow: `0 0 20px ${quiz?.color || "#A855F7"}40`,
                      }}
                    >
                      SIGN IN TO JOIN QUIZ
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Name input */}
                    <div className="mb-4">
                      <label className="block text-[10px] tracking-[0.2em] text-[#ae5cff]/60 mb-2 text-left font-bold" style={{ fontFamily: "var(--font-display)" }}>
                        LEADERBOARD DISPLAY NAME
                      </label>
                      <input
                        className="w-full px-4 py-3 rounded-xl text-sm text-center text-off-white outline-none transition-all"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(168,85,247,0.2)",
                        }}
                        placeholder="Enter your name..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && startQuiz()}
                      />
                    </div>

                    {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

                    <button
                      onClick={startQuiz}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${quiz?.color || "#A855F7"}, ${quiz?.color || "#A855F7"}CC)`,
                        color: "#fff",
                        fontFamily: "var(--font-display)",
                        letterSpacing: "0.1em",
                        boxShadow: `0 0 20px ${quiz?.color || "#A855F7"}40`,
                      }}
                    >
                      START QUIZ
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="glass-card p-4">
                <p className="text-off-white/40 text-sm">This quiz has {quiz?.status === "ended" ? "ended" : "not started yet"}.</p>
              </div>
            )}
          </div>
        </div>
      </SmoothScroller>
    );
  }

  // PLAYING PHASE
  if (phase === "playing" && questions[currentQ]) {
    const question = questions[currentQ];
    const timerPercent = quiz?.timeLimitSeconds > 0 ? (timeLeft / quiz.timeLimitSeconds) * 100 : 100;
    const timerColor = timerPercent > 50 ? "#34D399" : timerPercent > 20 ? "#F59E0B" : "#EF4444";

    return (
      <div className="min-h-screen gradient-hero">
        {/* Progress bar */}
        <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${quiz?.color || "#A855F7"}, ${quiz?.color || "#A855F7"}CC)`,
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 pt-20">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-xs text-off-white/30" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}>
              {currentQ + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-off-white/30">Score:</span>
              <span className="text-lg font-bold" style={{ color: quiz?.color || "#A855F7", fontFamily: "var(--font-display)" }}>{score}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Question area */}
            <div className="lg:col-span-2">
              {/* Timer */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-off-white/30">Time remaining</span>
                  <span className="text-lg font-bold" style={{ color: timerColor, fontFamily: "var(--font-display)" }}>{timeLeft}s</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${timerPercent}%`, background: timerColor }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="glass-card p-6 md:p-8 mb-6">
                <h2 className="text-lg md:text-xl font-bold text-off-white leading-relaxed">
                  {question.question}
                </h2>
                <div className="text-xs text-off-white/30 mt-2">{question.points || 10} points</div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(question.options || []).map((opt, oi) => {
                  let optStyle = {};
                  let borderColor = "rgba(168,85,247,0.15)";
                  let bgColor = "rgba(107,33,168,0.06)";

                  if (feedback) {
                    if (oi === feedback.correctIndex) {
                      borderColor = "rgba(52,211,153,0.5)";
                      bgColor = "rgba(52,211,153,0.1)";
                    } else if (oi === selectedIndex && !feedback.isCorrect) {
                      borderColor = "rgba(239,68,68,0.5)";
                      bgColor = "rgba(239,68,68,0.08)";
                    }
                  } else if (oi === selectedIndex) {
                    borderColor = `${quiz?.color || "#A855F7"}60`;
                    bgColor = `${quiz?.color || "#A855F7"}15`;
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() => !feedback && handleSubmitAnswer(oi)}
                      disabled={!!feedback || submitting}
                      className="p-4 rounded-xl text-left transition-all duration-300 hover:scale-[1.01]"
                      style={{
                        background: bgColor,
                        border: `1px solid ${borderColor}`,
                        cursor: feedback ? "default" : "pointer",
                        opacity: feedback && oi !== feedback.correctIndex && oi !== selectedIndex ? 0.4 : 1,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: feedback && oi === feedback.correctIndex
                              ? "rgba(52,211,153,0.2)"
                              : feedback && oi === selectedIndex && !feedback.isCorrect
                              ? "rgba(239,68,68,0.2)"
                              : "rgba(168,85,247,0.1)",
                            color: feedback && oi === feedback.correctIndex
                              ? "#34D399"
                              : feedback && oi === selectedIndex && !feedback.isCorrect
                              ? "#EF4444"
                              : "rgba(245,245,245,0.5)",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {feedback && oi === feedback.correctIndex ? "✓" : feedback && oi === selectedIndex && !feedback.isCorrect ? "✗" : String.fromCharCode(65 + oi)}
                        </div>
                        <span className="text-sm text-off-white">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback message */}
              {feedback && (
                <div
                  className="mt-4 p-3 rounded-xl text-center text-sm font-semibold"
                  style={{
                    background: feedback.isCorrect ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${feedback.isCorrect ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.2)"}`,
                    color: feedback.isCorrect ? "#34D399" : "#EF4444",
                  }}
                >
                  {feedback.isCorrect ? "🎉 Correct!" : "❌ Wrong answer"}
                </div>
              )}
            </div>

            {/* Mini Leaderboard */}
            <div className="hidden lg:block">
              <div className="glass-card p-5 sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <h3 className="text-xs font-bold tracking-[0.15em]" style={{ fontFamily: "var(--font-display)", color: "#34D399" }}>LIVE SCORES</h3>
                </div>
                {leaderboard.slice(0, 10).map((entry, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b" style={{ borderColor: "rgba(168,85,247,0.06)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs w-5" style={{ color: i < 3 ? "#F59E0B" : "rgba(245,245,245,0.3)" }}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                      </span>
                      <span className="text-xs text-off-white truncate max-w-[100px]">{entry.userName}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: quiz?.color || "#A855F7" }}>{entry.score}</span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-xs text-off-white/20 text-center py-4">No scores yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULT PHASE
  if (phase === "result") {
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const myRank = leaderboard.findIndex((e) => e.score === score) + 1;

    return (
      <SmoothScroller>
        <div className="min-h-screen gradient-hero">
          <div className="max-w-4xl mx-auto px-6 pt-28 pb-24">
            {/* Score Card */}
            <div className="glass-card p-8 md:p-12 text-center mb-8" style={{ boxShadow: `0 0 60px ${quiz?.color || "#A855F7"}15` }}>
              <div className="text-6xl mb-4">
                {percentage >= 80 ? "🏆" : percentage >= 50 ? "⭐" : "💪"}
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold text-gradient mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {percentage >= 80 ? "AMAZING!" : percentage >= 50 ? "GREAT JOB!" : "KEEP LEARNING!"}
              </h1>
              <p className="text-off-white/40 mb-8">You completed {quiz?.title}</p>

              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1" style={{ color: quiz?.color || "#A855F7", fontFamily: "var(--font-display)" }}>{score}</div>
                  <div className="text-xs text-off-white/30">SCORE</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-off-white mb-1" style={{ fontFamily: "var(--font-display)" }}>{percentage}%</div>
                  <div className="text-xs text-off-white/30">ACCURACY</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-1" style={{ color: "#F59E0B", fontFamily: "var(--font-display)" }}>#{myRank || "-"}</div>
                  <div className="text-xs text-off-white/30">RANK</div>
                </div>
              </div>

              <button
                onClick={() => router.push("/quiz")}
                className="px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${quiz?.color || "#A855F7"}, ${quiz?.color || "#A855F7"}CC)`,
                  color: "#fff",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.1em",
                }}
              >
                BACK TO QUIZZES
              </button>
            </div>

            {/* Full Leaderboard */}
            <div className="glass-card p-6 md:p-8">
              <h2
                className="text-sm font-bold tracking-[0.15em] mb-6"
                style={{ fontFamily: "var(--font-display)", color: "#F59E0B" }}
              >
                🏆 LEADERBOARD
              </h2>
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 rounded-xl transition-all"
                    style={{
                      background: i === 0 ? "rgba(245,158,11,0.08)" : i === 1 ? "rgba(192,192,192,0.05)" : i === 2 ? "rgba(205,127,50,0.05)" : "transparent",
                      border: `1px solid ${i < 3 ? "rgba(245,158,11,0.15)" : "rgba(168,85,247,0.06)"}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg w-8 text-center">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-sm text-off-white/30">{i + 1}</span>}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-off-white">{entry.userName}</div>
                        <div className="text-[10px] text-off-white/30">
                          {entry.completed ? "✓ Completed" : "⏳ In progress"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: i === 0 ? "#F59E0B" : quiz?.color || "#A855F7", fontFamily: "var(--font-display)" }}>
                        {entry.score}
                      </div>
                      <div className="text-[10px] text-off-white/30">pts</div>
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-center py-8 text-off-white/20 text-sm">No scores yet</p>
                )}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </SmoothScroller>
    );
  }

  return null;
}
