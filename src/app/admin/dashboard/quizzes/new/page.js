"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  background: "#f7f3f2",
  border: "1px solid #e5e7eb",
  color: "#131313",
  fontSize: "13px",
  outline: "none",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.1em",
  color: "#6b7280",
  fontWeight: 700,
  marginBottom: "8px",
  textTransform: "uppercase",
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "16px",
  padding: "28px",
  marginBottom: "20px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
};

const COLORS = ["#A855F7", "#C084FC", "#7C3AED", "#9333EA", "#8B5CF6", "#34D399", "#60A5FA", "#F59E0B"];
const emptyQuestion = () => ({ question: "", options: ["", "", "", ""], correctIndex: 0, points: 10 });

export default function NewQuizPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isExternalRedirect, setIsExternalRedirect] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "live",
    timeLimitSeconds: 30,
    color: "#A855F7",
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const updateQuestion = (qi, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[qi] = { ...next[qi], [field]: value };
      return next;
    });
  };

  const updateOption = (qi, oi, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      const opts = [...next[qi].options];
      opts[oi] = value;
      next[qi] = { ...next[qi], options: opts };
      return next;
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      isExternalRedirect,
      externalUrl: isExternalRedirect ? externalUrl : "",
      questions: isExternalRedirect ? [] : questions.filter((q) => q.question.trim()),
    };

    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push("/admin/dashboard/quizzes");
      else { const d = await res.json(); setError(d.error || "Failed to create quiz"); }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout
      badge="05 / QUIZZES"
      title="Create Quiz."
      subtitle="Build an in-app interactive quiz or link an external quiz form"
    >
      <form onSubmit={handleSubmit} className="max-w-[760px]">
        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Delivery Mode Toggle & Basic Info */}
        <div style={cardStyle}>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-5">
            <div>
              <span className="font-mono-label text-xs uppercase font-bold text-gray-500 block mb-1">
                Initial Status
              </span>
              <div className="flex gap-2">
                {["draft", "live"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => update("status", st)}
                    className={`px-3.5 py-1 rounded-full font-mono-label text-xs uppercase font-bold transition-all cursor-pointer ${
                      form.status === st
                        ? st === "live"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-gray-800 text-white"
                        : "bg-[#f7f3f2] text-gray-600 hover:text-black border border-gray-200"
                    }`}
                  >
                    {st === "live" ? "• Live Immediately" : "Draft"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="font-mono-label text-xs uppercase font-bold text-gray-500 block mb-1">
                Quiz Mode
              </span>
              <div className="flex p-1 bg-[#f1edec] rounded-full border border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsExternalRedirect(false)}
                  className={`px-3.5 py-1 rounded-full font-mono-label text-xs uppercase font-bold transition-all cursor-pointer ${
                    !isExternalRedirect
                      ? "bg-[#131313] text-white shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  In-App Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setIsExternalRedirect(true)}
                  className={`px-3.5 py-1 rounded-full font-mono-label text-xs uppercase font-bold transition-all cursor-pointer ${
                    isExternalRedirect
                      ? "bg-[#131313] text-white shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  External Link ↗
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label style={labelStyle}>Quiz Title</label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. AWS Cloud Practitioner Challenge"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Short summary of what this quiz covers…"
              />
            </div>

            {isExternalRedirect ? (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <label style={{ ...labelStyle, color: "#065f46" }}>
                  External Quiz URL (Google Form / Quizizz / Kahoot / Unstop)
                </label>
                <input
                  style={{ ...inputStyle, background: "#ffffff", borderColor: "#a7f3d0" }}
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://forms.gle/... or https://quizizz.com/..."
                  required={isExternalRedirect}
                />
                <p className="font-mono-label text-[11px] text-emerald-700 mt-2">
                  When users click this quiz on the site, they will be redirected to this external link.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Time Per Question (Seconds)</label>
                  <input
                    style={inputStyle}
                    type="number"
                    min={10}
                    max={300}
                    value={form.timeLimitSeconds}
                    onChange={(e) => update("timeLimitSeconds", Number(e.target.value))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Accent Color</label>
                  <div className="flex gap-2 items-center mt-1">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => update("color", c)}
                        className="w-7 h-7 rounded-lg transition-transform cursor-pointer"
                        style={{
                          background: c,
                          border: form.color === c ? "2px solid #131313" : "2px solid transparent",
                          transform: form.color === c ? "scale(1.15)" : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Question Builder (In-App mode only) */}
        {!isExternalRedirect && (
          <div style={cardStyle}>
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313]">
                Questions ({questions.length})
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                className="font-mono-label text-xs font-bold text-[#131313] hover:underline cursor-pointer"
              >
                + Add Question
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {questions.map((q, qi) => (
                <div
                  key={qi}
                  className="p-5 rounded-xl bg-[#f7f3f2] border border-gray-200/90 relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono-label text-xs font-bold text-gray-700 uppercase">
                      Question {qi + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qi)}
                        className="text-red-500 hover:text-red-700 font-mono-label text-xs font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    style={{ ...inputStyle, background: "#ffffff", marginBottom: "12px" }}
                    value={q.question}
                    onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                    placeholder="e.g. Which AWS service provides object storage?"
                    required
                  />

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`new-correct-${qi}`}
                          checked={q.correctIndex === oi}
                          onChange={() => updateQuestion(qi, "correctIndex", oi)}
                          className="cursor-pointer"
                          title="Mark as correct answer"
                        />
                        <input
                          style={{
                            ...inputStyle,
                            background: "#ffffff",
                            borderColor: q.correctIndex === oi ? "#10b981" : "#e5e7eb",
                          }}
                          value={opt}
                          onChange={(e) => updateOption(qi, oi, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-full border border-gray-300 hover:border-black text-gray-700 font-mono-label text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-[#131313] hover:bg-black text-white font-mono-label text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Quiz"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
