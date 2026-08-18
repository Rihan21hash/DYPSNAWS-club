"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(168,85,247,0.15)", color: "#F5F5F5", fontSize: "13px", outline: "none" };
const labelStyle = { display: "block", fontSize: "10px", fontFamily: "var(--font-display)", letterSpacing: "0.15em", color: "rgba(168,85,247,0.5)", marginBottom: "8px" };
const COLORS = ["#A855F7", "#C084FC", "#7C3AED", "#9333EA", "#8B5CF6"];

export default function EditMemberPage() {
  return (
    <Suspense fallback={<AdminLayout title="LOADING..."><div style={{ padding: "60px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>Loading...</div></AdminLayout>}>
      <EditMemberForm />
    </Suspense>
  );
}

function EditMemberForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const isContributor = searchParams.get("type") === "contributor";

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);

  useEffect(() => {
    const url = isContributor
      ? `/api/team/${params.id}?type=contributor`
      : `/api/team/${params.id}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); }
        else {
          if (isContributor) {
            setForm({
              name: data.name || "", role: data.role || "", tagline: data.tagline || "",
              avatar: data.avatar || "", color: data.color || "#A855F7",
            });
          } else {
            setForm({
              name: data.name || "", role: data.role || "", tagline: data.tagline || "",
              avatar: data.avatar || "", color: data.color || "#A855F7", bio: data.bio || "",
              certifications: data.certifications?.length ? data.certifications : [""],
              social: { github: data.social?.github || "", linkedin: data.social?.linkedin || "", twitter: data.social?.twitter || "" },
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [params.id, isContributor]);

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
      const res = await fetch(`/api/team/${params.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) router.push("/admin/dashboard/team");
      else { const d = await res.json(); setError(d.error || "Failed"); }
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  const title = isContributor ? "EDIT CONTRIBUTOR" : "EDIT MEMBER";

  if (loading) return <AdminLayout title={title}><div style={{ padding: "60px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>Loading...</div></AdminLayout>;
  if (!form) return <AdminLayout title="NOT FOUND"><div style={{ padding: "60px", textAlign: "center", color: "rgba(245,245,245,0.3)" }}>{error}</div></AdminLayout>;

  return (
    <AdminLayout title={title} subtitle={`Editing: ${form.name}`}>
      <form onSubmit={handleSubmit} style={{ maxWidth: "700px" }}>
        {error && <div style={{ padding: "10px 16px", borderRadius: "10px", background: "rgba(245,100,100,0.1)", border: "1px solid rgba(245,100,100,0.2)", color: "#F56565", fontSize: "13px", marginBottom: "20px" }}>{error}</div>}

        <div style={{ background: "rgba(107,33,168,0.06)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "12px", fontFamily: "var(--font-display)", letterSpacing: "0.15em", color: "rgba(245,245,245,0.4)", marginBottom: "20px" }}>BASIC INFO</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div><label style={labelStyle}>NAME</label><input style={inputStyle} value={form.name} onChange={(e) => update("name", e.target.value)} required /></div>
            <div><label style={labelStyle}>ROLE</label><input style={inputStyle} value={form.role} onChange={(e) => update("role", e.target.value)} required /></div>
            <div><label style={labelStyle}>AVATAR INITIALS</label><input style={inputStyle} value={form.avatar} onChange={(e) => update("avatar", e.target.value.toUpperCase().slice(0,2))} maxLength={2} required /></div>
            <div>
              <label style={labelStyle}>COLOR</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {COLORS.map((c) => (<button key={c} type="button" onClick={() => update("color", c)} style={{ width: "28px", height: "28px", borderRadius: "8px", background: c, border: form.color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer" }} />))}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>TAGLINE</label><input style={inputStyle} value={form.tagline} onChange={(e) => update("tagline", e.target.value)} /></div>
            {!isContributor && (
              <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>BIO</label><textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} value={form.bio} onChange={(e) => update("bio", e.target.value)} /></div>
            )}
          </div>
        </div>

        {/* Core members: certs + social */}
        {!isContributor && (
          <>
            <div style={{ background: "rgba(107,33,168,0.06)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "12px", fontFamily: "var(--font-display)", letterSpacing: "0.15em", color: "rgba(245,245,245,0.4)", marginBottom: "20px" }}>CERTIFICATIONS</h3>
              {form.certifications.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "10px", alignItems: "center" }}>
                  <input style={inputStyle} value={c} onChange={(e) => { const arr = [...form.certifications]; arr[i] = e.target.value; update("certifications", arr); }} placeholder="Certification name" />
                  {form.certifications.length > 1 && <button type="button" onClick={() => update("certifications", form.certifications.filter((_, j) => j !== i))} style={{ color: "rgba(245,100,100,0.6)", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>×</button>}
                </div>
              ))}
              <button type="button" onClick={() => update("certifications", [...form.certifications, ""])} style={{ color: "#A855F7", background: "none", border: "none", cursor: "pointer", fontSize: "12px" }}>+ Add certification</button>
            </div>

            <div style={{ background: "rgba(107,33,168,0.06)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "12px", fontFamily: "var(--font-display)", letterSpacing: "0.15em", color: "rgba(245,245,245,0.4)", marginBottom: "20px" }}>SOCIAL LINKS</h3>
              <div style={{ display: "grid", gap: "16px" }}>
                <div><label style={labelStyle}>GITHUB</label><input style={inputStyle} value={form.social.github} onChange={(e) => update("social", { ...form.social, github: e.target.value })} /></div>
                <div><label style={labelStyle}>LINKEDIN</label><input style={inputStyle} value={form.social.linkedin} onChange={(e) => update("social", { ...form.social, linkedin: e.target.value })} /></div>
                <div><label style={labelStyle}>TWITTER</label><input style={inputStyle} value={form.social.twitter} onChange={(e) => update("social", { ...form.social, twitter: e.target.value })} /></div>
              </div>
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button type="button" onClick={() => router.back()} style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid rgba(168,85,247,0.2)", background: "transparent", color: "rgba(245,245,245,0.5)", fontSize: "12px", cursor: "pointer", fontFamily: "var(--font-display)", letterSpacing: "0.1em" }}>CANCEL</button>
          <button type="submit" disabled={saving} style={{ padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #6B21A8, #A855F7)", color: "#fff", fontSize: "12px", fontFamily: "var(--font-display)", letterSpacing: "0.1em", border: "none", cursor: "pointer", fontWeight: 600, opacity: saving ? 0.6 : 1 }}>{saving ? "SAVING..." : isContributor ? "UPDATE CONTRIBUTOR" : "UPDATE MEMBER"}</button>
        </div>
      </form>
    </AdminLayout>
  );
}
