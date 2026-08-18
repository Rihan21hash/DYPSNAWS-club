"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.15)", color: "#F5F5F5", fontSize: "13px", outline: "none" };
const labelStyle = { display: "block", fontSize: "10px", fontFamily: "var(--font-display)", letterSpacing: "0.15em", color: "rgba(168,85,247,0.5)", marginBottom: "8px" };
const COLORS = ["#A855F7", "#7C3AED", "#9333EA", "#C084FC", "#8B5CF6"];
const LEVELS = ["Foundational", "Associate", "Professional", "Specialty"];

export default function EditCertPage() {
  const router = useRouter();
  const params = useParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [image, setImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetch(`/api/certifications/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setForm({
            name: data.name || "", code: data.code || "", level: data.level || "Associate",
            color: data.color || "#A855F7", description: data.description || "",
            duration: data.duration || "", questions: data.questions || 65,
            passingScore: data.passingScore || "", topics: data.topics?.length ? data.topics : [""],
          });
          setImage(data.image || "");
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { ...form, questions: Number(form.questions), topics: form.topics.filter((t) => t.trim()), image };

    try {
      const res = await fetch(`/api/certifications/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) router.push("/admin/dashboard/certifications");
      else { const d = await res.json(); setError(d.error || "Failed"); }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  if (loading) return <AdminLayout title="EDIT CERTIFICATION"><div style={{ padding: "60px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>Loading...</div></AdminLayout>;
  if (!form) return <AdminLayout title="NOT FOUND"><div style={{ padding: "60px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>{error}</div></AdminLayout>;

  return (
    <AdminLayout title="EDIT CERTIFICATION" subtitle={`Editing: ${form.name}`}>
      <form onSubmit={handleSubmit} style={{ maxWidth: "700px" }}>
        {error && <div style={{ padding: "10px 16px", borderRadius: "10px", background: "rgba(245,100,100,0.1)", border: "1px solid rgba(245,100,100,0.2)", color: "#F56565", fontSize: "13px", marginBottom: "20px" }}>{error}</div>}

        <div style={{ background: "rgba(107,33,168,0.06)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "12px", fontFamily: "var(--font-display)", letterSpacing: "0.15em", color: "rgba(245,245,245,0.4)", marginBottom: "20px" }}>CERTIFICATION INFO</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div><label style={labelStyle}>NAME</label><input style={inputStyle} value={form.name} onChange={(e) => update("name", e.target.value)} required /></div>
            <div><label style={labelStyle}>CODE</label><input style={inputStyle} value={form.code} onChange={(e) => update("code", e.target.value)} required /></div>
            <div><label style={labelStyle}>LEVEL</label><select style={{ ...inputStyle, cursor: "pointer" }} value={form.level} onChange={(e) => update("level", e.target.value)}>{LEVELS.map((l) => (<option key={l} value={l} style={{ background: "#1a1a2e" }}>{l}</option>))}</select></div>
            <div><label style={labelStyle}>COLOR</label><div style={{ display: "flex", gap: "8px" }}>{COLORS.map((c) => (<button key={c} type="button" onClick={() => update("color", c)} style={{ width: "28px", height: "28px", borderRadius: "8px", background: c, border: form.color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer" }} />))}</div></div>
            <div><label style={labelStyle}>DURATION</label><input style={inputStyle} value={form.duration} onChange={(e) => update("duration", e.target.value)} /></div>
            <div><label style={labelStyle}>QUESTIONS</label><input style={inputStyle} type="number" value={form.questions} onChange={(e) => update("questions", e.target.value)} /></div>
            <div><label style={labelStyle}>PASSING SCORE</label><input style={inputStyle} value={form.passingScore} onChange={(e) => update("passingScore", e.target.value)} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>DESCRIPTION</label><textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={form.description} onChange={(e) => update("description", e.target.value)} required /></div>
          </div>
        </div>

        <div style={{ background: "rgba(107,33,168,0.06)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "12px", fontFamily: "var(--font-display)", letterSpacing: "0.15em", color: "rgba(245,245,245,0.4)", marginBottom: "20px" }}>EXAM TOPICS</h3>
          {form.topics.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "10px", alignItems: "center" }}>
              <input style={inputStyle} value={t} onChange={(e) => { const arr = [...form.topics]; arr[i] = e.target.value; update("topics", arr); }} />
              {form.topics.length > 1 && <button type="button" onClick={() => update("topics", form.topics.filter((_, j) => j !== i))} style={{ color: "rgba(245,100,100,0.6)", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>×</button>}
            </div>
          ))}
          <button type="button" onClick={() => update("topics", [...form.topics, ""])} style={{ color: "#A855F7", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}>+ Add topic</button>
        </div>

        {/* Certificate Image */}
        <div style={{ background: "rgba(107,33,168,0.06)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "12px", fontFamily: "var(--font-display)", letterSpacing: "0.15em", color: "rgba(245,245,245,0.4)", marginBottom: "20px" }}>CERTIFICATE IMAGE</h3>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              if (!e.target.files?.[0]) return;
              setUploadingImage(true);
              const fd = new FormData();
              fd.append("file", e.target.files[0]);
              const res = await fetch("/api/upload", { method: "POST", body: fd });
              if (res.ok) { const d = await res.json(); setImage(d.url); }
              setUploadingImage(false);
            }}
            style={{ ...inputStyle, cursor: "pointer" }}
          />
          {uploadingImage && <p style={{ fontSize: "11px", color: "#A855F7", marginTop: "4px" }}>Uploading...</p>}
          {image && (
            <div style={{ marginTop: "12px", position: "relative", display: "inline-block" }}>
              <img src={image} alt="cert" style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "12px", border: "1px solid rgba(168,85,247,0.2)" }} />
              <button type="button" onClick={() => setImage("")} style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: "#F56565", color: "#fff", border: "none", cursor: "pointer", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button type="button" onClick={() => router.back()} style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid rgba(168,85,247,0.2)", background: "transparent", color: "rgba(245,245,245,0.5)", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}>CANCEL</button>
          <button type="submit" disabled={saving} style={{ padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #6B21A8, #A855F7)", color: "#fff", fontSize: "12px", fontFamily: "var(--font-display)", letterSpacing: "0.1em", border: "none", cursor: "pointer", fontWeight: 600, opacity: saving ? 0.6 : 1 }}>{saving ? "SAVING..." : "UPDATE CERTIFICATION"}</button>
        </div>
      </form>
    </AdminLayout>
  );
}
