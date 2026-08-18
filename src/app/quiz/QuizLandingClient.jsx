"use client";

import Link from "next/link";
import SmoothScroller from "@/components/SmoothScroller";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import useRealtimeTable from "@/hooks/useRealtimeTable";

export default function QuizLandingPage() {
  const { data: quizzes, loading } = useRealtimeTable("quizzes", "/api/quizzes");

  const liveQuizzes = quizzes.filter((q) => q.status === "live");
  const endedQuizzes = quizzes.filter((q) => q.status === "ended");
  const upcomingQuizzes = quizzes.filter((q) => q.status !== "live" && q.status !== "ended");

  return (
    <SmoothScroller>
      <PageTransition>
        <div className="bg-[#fdf8f8] min-h-screen flex flex-col pt-20 text-[#1c1b1b]">
          {/* Main Content */}
          <main className="max-w-[1440px] mx-auto px-5 md:px-16 grid grid-cols-12 gap-8 pt-16 md:pt-24 pb-24 min-h-[calc(100vh-200px)] w-full">
            {/* Minimalist Side Panel (Context) */}
            <aside className="col-span-12 md:col-span-3 flex flex-col gap-6 md:sticky md:top-32 h-fit">
              {/* Live Status Glass Card */}
              <div className="glass-panel bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-mono-label text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" />
                  Quiz Engine Status
                </h3>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#131313] text-3xl">
                    quiz
                  </span>
                  <div>
                    <span className="font-headline-lg-mobile text-2xl font-bold text-[#131313] block leading-tight">
                      Online
                    </span>
                    <span className="font-mono-label text-xs text-gray-500">
                      Ready to take quizzes
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Context */}
              <div className="bg-[#f7f3f2] border border-gray-200 rounded-2xl p-6">
                <h3 className="font-mono-label text-xs text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">
                    folder_open
                  </span>
                  Module Context
                </h3>
                <div className="space-y-4 font-mono-label text-xs text-gray-600">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span>Curriculum</span>
                    <span className="font-bold text-[#131313]">Cloud Practitioner</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span>Active Modules</span>
                    <span className="font-bold text-[#131313]">{quizzes.length}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span>Format</span>
                    <span className="font-bold text-[#131313]">Multiple Choice</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Realtime Sync</span>
                    <span className="font-bold text-emerald-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Rule Card */}
              <div className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm">
                <h3 className="font-mono-label text-xs font-bold text-[#131313] uppercase tracking-wider mb-2">
                  Protocol Notice
                </h3>
                <p className="font-body-md text-xs text-gray-500 leading-relaxed">
                  Questions are timed. Real-time leaderboards record top scores. Complete all questions for maximum points.
                </p>
              </div>
            </aside>

            {/* Main Center Stage */}
            <section className="col-span-12 md:col-span-9 flex flex-col gap-10">
              {/* Header */}
              <div>
                <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-xs uppercase tracking-widest text-gray-600 bg-white mb-4 shadow-sm">
                  05 / KNOWLEDGE CHECK
                </span>
                <h1 className="font-display-xl text-4xl sm:text-6xl font-extrabold text-[#131313] tracking-tight mb-4">
                  AWS Builder Quizzes.
                </h1>
                <p className="font-body-lg text-base sm:text-lg text-gray-600 max-w-2xl">
                  Test your cloud expertise with timed challenges, earn leaderboard ranks, and validate your foundational knowledge.
                </p>
              </div>

              {loading && (
                <div className="py-16 text-center text-gray-400 font-mono-label text-xs">
                  Loading available quizzes…
                </div>
              )}

              {!loading && quizzes.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-500 font-mono-label text-xs shadow-sm">
                  No active quizzes right now. Stay tuned for upcoming challenges!
                </div>
              )}

              {/* Live Quizzes (from DB) */}
              {!loading && liveQuizzes.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-green" />
                    <h2 className="font-mono-label text-xs font-bold uppercase tracking-widest text-emerald-600">
                      Active Challenges
                    </h2>
                  </div>

                  {liveQuizzes.map((quiz) => {
                    const isRedirect = Boolean(quiz.isExternalRedirect || quiz.externalUrl);
                    const href = isRedirect ? quiz.externalUrl : `/quiz/${quiz.id}`;

                    return (
                      <a
                        key={quiz.id}
                        href={href}
                        target={isRedirect ? "_blank" : "_self"}
                        rel={isRedirect ? "noopener noreferrer" : undefined}
                        className="group bg-white border border-gray-200 hover:border-black rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono-label text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold uppercase">
                              LIVE NOW
                            </span>
                            {isRedirect ? (
                              <span className="font-mono-label text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold uppercase">
                                EXTERNAL LINK ↗
                              </span>
                            ) : (
                              <span className="font-mono-label text-xs text-gray-500">
                                {quiz.questionCount || quiz.questions?.length || 5} Questions • {quiz.timeLimitSeconds || 30}s each
                              </span>
                            )}
                          </div>
                          <h3 className="font-headline-lg-mobile text-xl sm:text-2xl font-bold text-[#131313] mb-2 group-hover:text-black transition-colors">
                            {quiz.title}
                          </h3>
                          <p className="font-body-md text-sm text-gray-600 max-w-xl">
                            {quiz.description || "Join this AWS quiz and test your skills!"}
                          </p>
                        </div>

                        <span className="bg-[#131313] text-white font-mono-label text-xs px-6 py-3 rounded-full hover:bg-black transition-all flex items-center gap-2 flex-shrink-0 font-bold uppercase tracking-wider shadow-sm">
                          {isRedirect ? "Open Quiz ↗" : "Start Quiz"}
                          <span className="material-symbols-outlined text-[16px]">
                            {isRedirect ? "open_in_new" : "arrow_forward"}
                          </span>
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Upcoming / Draft Quizzes */}
              {!loading && upcomingQuizzes.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-mono-label text-xs font-bold uppercase tracking-widest text-gray-500">
                    Upcoming Modules
                  </h2>

                  {upcomingQuizzes.map((quiz) => {
                    const isRedirect = Boolean(quiz.isExternalRedirect || quiz.externalUrl);
                    const href = isRedirect ? quiz.externalUrl : `/quiz/${quiz.id}`;

                    return (
                      <a
                        key={quiz.id}
                        href={href}
                        target={isRedirect ? "_blank" : "_self"}
                        rel={isRedirect ? "noopener noreferrer" : undefined}
                        className="group bg-white border border-gray-200 hover:border-[#131313] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-2 font-mono-label text-xs text-gray-500">
                            {isRedirect ? (
                              <span className="text-blue-600 font-bold">External Quiz Link</span>
                            ) : (
                              <>
                                <span>{quiz.questionCount || 5} Questions</span>
                                <span>•</span>
                                <span>{quiz.timeLimitSeconds || 30}s per question</span>
                              </>
                            )}
                          </div>
                          <h3 className="font-body-lg text-lg sm:text-xl font-bold text-[#131313] mb-1 group-hover:text-black">
                            {quiz.title}
                          </h3>
                          <p className="font-body-md text-sm text-gray-600 line-clamp-2">
                            {quiz.description}
                          </p>
                        </div>

                        <span className="font-mono-label text-xs text-gray-900 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          {isRedirect ? "Open Link ↗" : "Start →"}
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Completed Quizzes */}
              {!loading && endedQuizzes.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-mono-label text-xs font-bold uppercase tracking-widest text-gray-400">
                    Completed Challenges
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {endedQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="p-5 rounded-2xl bg-white border border-gray-200 opacity-70"
                      >
                        <span className="font-mono-label text-[10px] text-gray-400 uppercase font-bold block mb-1">
                          CONCLUDED
                        </span>
                        <h4 className="font-body-lg text-base font-bold text-[#131313] mb-1">
                          {quiz.title}
                        </h4>
                        <p className="font-body-md text-xs text-gray-500">
                          {quiz.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </main>

          <Footer />
        </div>
      </PageTransition>
    </SmoothScroller>
  );
}
