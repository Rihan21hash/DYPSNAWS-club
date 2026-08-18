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

const COLORS = ["#A855F7", "#7C3AED", "#9333EA", "#C084FC", "#8B5CF6", "#0073BB", "#10B981"];
const LEVELS = ["Foundational", "Associate", "Professional", "Specialty"];

export default function NewCertPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", code: "", level: "Associate", color: "#A855F7",
    description: "", duration: "130 minutes", questions: 65, passingScore: "720/1000",
    topics: [""],
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { ...form, questions: form.questions, topics: form.topics.filter((t) => t.trim()) };

    try {
      const res = await fetch("/api/certifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) router.push("/admin/dashboard/certifications");
      else { const d = await res.json(); setError(d.error || "Failed"); }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout
      badge="04 / CERTIFICATIONS"
      title="Add Certification."
      subtitle="Add a new official AWS certification pathway"
    >
      <form onSubmit={handleSubmit} className="max-w-[700px]">
        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <div style={cardStyle}>
          <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-5 pb-3 border-b border-gray-100">
            Certification Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Certification Name</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="AWS Certified Solutions Architect – Associate"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Exam Code</label>
              <input
                style={inputStyle}
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                placeholder="SAA-C03"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Tier / Level</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.level}
                onChange={(e) => update("level", e.target.value)}
              >
                {LEVELS.map((l) => (<option key={l} value={l}>{l}</option>))}
              </select>
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
            <div className="sm:col-span-2">
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Summary of what this credential validates…"
              />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-5 pb-3 border-b border-gray-100">
            Exam Format
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label style={labelStyle}>Duration</label>
              <input
                style={inputStyle}
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                placeholder="130 mins"
              />
            </div>
            <div>
              <label style={labelStyle}>Questions Count</label>
              <input
                style={inputStyle}
                value={form.questions}
                onChange={(e) => update("questions", e.target.value)}
                placeholder="65 questions"
              />
            </div>
            <div>
              <label style={labelStyle}>Passing Score</label>
              <input
                style={inputStyle}
                value={form.passingScore}
                onChange={(e) => update("passingScore", e.target.value)}
                placeholder="720 / 1000"
              />
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-5 pb-3 border-b border-gray-100">
            Exam Domains & Topics
          </h3>
          {form.topics.map((t, i) => (
            <div key={i} className="flex gap-3 mb-3 items-center">
              <input
                style={inputStyle}
                value={t}
                onChange={(e) => {
                  const arr = [...form.topics];
                  arr[i] = e.target.value;
                  update("topics", arr);
                }}
                placeholder="e.g. Design Resilient Architectures"
              />
              {form.topics.length > 1 && (
                <button
                  type="button"
                  onClick={() => update("topics", form.topics.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500 text-lg px-2 cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => update("topics", [...form.topics, ""])}
            className="font-mono-label text-xs font-bold text-[#131313] hover:underline cursor-pointer mt-1"
          >
            + Add Exam Domain
          </button>
        </div>

        <div className="flex gap-3 justify-end mt-4">
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
            {saving ? "Saving…" : "Add Certification"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
