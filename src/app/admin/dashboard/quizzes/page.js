"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

export default function QuizzesListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/quizzes")
      .then((r) => r.json())
      .then((data) => setQuizzes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    setDeleting(id);
    const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    }
    setDeleting(null);
  };

  return (
    <AdminLayout
      badge="05 / QUIZZES"
      title="Live Quizzes & Challenges."
      subtitle="Create interactive quizzes, manage questions, and launch live sessions"
    >
      {/* Header bar */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-mono-label text-xs text-gray-500 font-semibold">
          {quizzes.length} {quizzes.length === 1 ? "Quiz" : "Quizzes"} Total
        </span>
        <Link
          href="/admin/dashboard/quizzes/new"
          className="px-5 py-2.5 rounded-full bg-[#131313] hover:bg-black text-white text-xs font-mono-label font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Quiz
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-12 px-6 py-4 bg-[#f7f3f2] border-b border-gray-200 font-mono-label text-[11px] uppercase tracking-wider text-gray-600 font-bold">
          <span className="col-span-5">Quiz Title</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Questions</span>
          <span className="col-span-1">Time Limit</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        {loading && (
          <div className="py-12 text-center text-gray-400 font-mono-label text-xs">
            Loading quizzes…
          </div>
        )}

        {!loading && quizzes.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-mono-label text-xs">
            No quizzes found. Click &quot;Create Quiz&quot; to build one.
          </div>
        )}

        {quizzes.map((q) => (
          <div
            key={q.id}
            className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 last:border-none items-center hover:bg-[#f7f3f2]/50 transition-colors"
          >
            {/* Title */}
            <div className="col-span-5 pr-4">
              <div className="font-body-lg text-sm font-bold text-[#131313]">
                {q.title}
              </div>
              <div className="font-mono-label text-xs text-gray-400 truncate mt-0.5">
                {q.description}
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono-label text-[10px] uppercase font-bold ${
                  q.status === "live"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : q.status === "ended"
                    ? "bg-gray-100 text-gray-600 border border-gray-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    q.status === "live" ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                  }`}
                />
                {q.status || "Draft"}
              </span>
            </div>

            {/* Questions count */}
            <div className="col-span-2 font-mono-label text-xs text-gray-600">
              {q.questionCount || q.questions?.length || 0} Questions
            </div>

            {/* Time limit */}
            <div className="col-span-1 font-mono-label text-xs text-gray-500">
              {q.timeLimitSeconds || 30}s
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-2">
              <button
                onClick={() => router.push(`/admin/dashboard/quizzes/${q.id}`)}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:border-black text-[#131313] font-mono-label text-xs font-bold transition-colors cursor-pointer"
              >
                Manage
              </button>
              <button
                onClick={() => handleDelete(q.id)}
                disabled={deleting === q.id}
                className="px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 font-mono-label text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting === q.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
