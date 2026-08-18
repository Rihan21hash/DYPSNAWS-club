"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const COLORS = ["#A855F7", "#C084FC", "#7C3AED", "#9333EA", "#8B5CF6", "#0073BB", "#10B981"];

export default function NewMemberPage() {
  return (
    <Suspense fallback={<AdminLayout title="LOADING..."><div className="p-12 text-center text-gray-400 font-mono-label text-xs">Loading…</div></AdminLayout>}>
      <NewMemberForm />
    </Suspense>
  );
}

function NewMemberForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isContributor = searchParams.get("type") === "contributor";

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(
    isContributor
      ? { name: "", role: "", tagline: "", avatar: "", color: "#A855F7" }
      : {
          name: "", role: "", tagline: "", avatar: "", color: "#A855F7", bio: "",
          certifications: [""],
          social: { github: "", linkedin: "", twitter: "" },
        }
  );

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    let payload;
    if (isContributor) {
      payload = { ...form, _type: "contributor" };
    } else {
      payload = {
        ...form,
        certifications: form.certifications.filter((c) => c.trim()),
        social: Object.fromEntries(Object.entries(form.social).filter(([, v]) => v.trim())),
      };
    }

    try {
      const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) router.push("/admin/dashboard/team");
      else { const d = await res.json(); setError(d.error || "Failed"); }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  const title = isContributor ? "Add Contributor." : "Add Team Member.";

  return (
    <AdminLayout
      badge="03 / TEAM"
      title={title}
      subtitle={isContributor ? "Add a new club contributor" : "Add a new core leadership member"}
    >
      <form onSubmit={handleSubmit} className="max-w-[700px]">
        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <div style={cardStyle}>
          <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-5 pb-3 border-b border-gray-100">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => {
                  update("name", e.target.value);
                  update("avatar", e.target.value.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2));
                }}
                placeholder="e.g. Tushar Kumbhar"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Role / Title</label>
              <input
                style={inputStyle}
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                placeholder="e.g. Captain or Technical Lead"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Avatar Initials</label>
              <input
                style={inputStyle}
                value={form.avatar}
                onChange={(e) => update("avatar", e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                required
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
            <div className="sm:col-span-2">
              <label style={labelStyle}>Tagline</label>
              <input
                style={inputStyle}
                value={form.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                placeholder="Short tagline (e.g. Architecting the future on AWS)"
              />
            </div>
            {!isContributor && (
              <div className="sm:col-span-2">
                <label style={labelStyle}>Bio / Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="Short bio about leadership responsibilities…"
                />
              </div>
            )}
          </div>
        </div>

        {/* Core members only: certs + social */}
        {!isContributor && (
          <>
            <div style={cardStyle}>
              <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-5 pb-3 border-b border-gray-100">
                AWS Certifications
              </h3>
              {form.certifications.map((c, i) => (
                <div key={i} className="flex gap-3 mb-3 items-center">
                  <input
                    style={inputStyle}
                    value={c}
                    onChange={(e) => {
                      const arr = [...form.certifications];
                      arr[i] = e.target.value;
                      update("certifications", arr);
                    }}
                    placeholder="e.g. AWS Certified Cloud Practitioner"
                  />
                  {form.certifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => update("certifications", form.certifications.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-red-500 text-lg px-2 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => update("certifications", [...form.certifications, ""])}
                className="font-mono-label text-xs font-bold text-[#131313] hover:underline cursor-pointer mt-1"
              >
                + Add Certification
              </button>
            </div>

            <div style={cardStyle}>
              <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-5 pb-3 border-b border-gray-100">
                Social Profiles
              </h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label style={labelStyle}>GitHub URL</label>
                  <input
                    style={inputStyle}
                    value={form.social.github}
                    onChange={(e) => update("social", { ...form.social, github: e.target.value })}
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label style={labelStyle}>LinkedIn URL</label>
                  <input
                    style={inputStyle}
                    value={form.social.linkedin}
                    onChange={(e) => update("social", { ...form.social, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Twitter / X URL</label>
                  <input
                    style={inputStyle}
                    value={form.social.twitter}
                    onChange={(e) => update("social", { ...form.social, twitter: e.target.value })}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
            </div>
          </>
        )}

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
            {saving ? "Saving…" : isContributor ? "Add Contributor" : "Add Member"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
