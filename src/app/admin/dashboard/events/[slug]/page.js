"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import FormFieldsEditor from "@/components/admin/FormFieldsEditor";

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

const EVENT_TYPES = ["WORKSHOP", "HACKATHON", "CERTIFICATION", "SUMMIT", "FESTIVAL"];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registrationType, setRegistrationType] = useState("form");
  const [externalRegistrationUrl, setExternalRegistrationUrl] = useState("");

  const [form, setForm] = useState(null);

  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setForm({
            title: data.title || "",
            date: data.date || "",
            desc: data.desc || data.description || "",
            type: data.type || "WORKSHOP",
            color: data.color || "#8B5CF6",
            location: data.location || "DYPSN Campus",
            capacity: data.capacity || 50,
            status: data.status || "Upcoming",
            featured: data.featured !== false,
            prerequisites: data.prerequisites?.length ? data.prerequisites : [""],
            schedule: data.schedule?.length ? data.schedule : [{ time: "", topic: "" }],
            speakers: data.speakers?.length ? data.speakers : [{ name: "", role: "", topic: "" }],
            formFields: data.formFields || [],
          });
          setRegistrationType(data.registrationType || (data.externalRegistrationUrl ? "redirect" : "form"));
          setExternalRegistrationUrl(data.externalRegistrationUrl || "");
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      capacity: Number(form.capacity) || 50,
      registrationType,
      externalRegistrationUrl: registrationType === "redirect" ? externalRegistrationUrl : "",
      prerequisites: form.prerequisites.filter((p) => p.trim()),
      schedule: form.schedule.filter((s) => s.time.trim() || s.topic.trim()),
      speakers: form.speakers.filter((s) => s.name.trim()),
      formFields: registrationType === "form" ? form.formFields.filter((f) => f.label.trim()) : [],
    };

    try {
      const res = await fetch(`/api/events/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/dashboard/events");
      } else {
        const d = await res.json();
        setError(d.error || "Failed to update event");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout badge="02 / EVENTS" title="Edit Event" subtitle="Loading event details…">
        <div className="py-12 text-center text-gray-400 font-mono-label text-xs">
          Loading…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      badge="02 / EVENTS"
      title="Edit Event."
      subtitle={`Editing: ${form?.title || slug}`}
    >
      <form onSubmit={handleSubmit} className="max-w-[800px]">
        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Action bar for registrations link */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href={`/admin/dashboard/events/${slug}/registrations`}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-black font-mono-label text-xs font-bold text-[#131313] transition-colors inline-flex items-center gap-2"
          >
            <span>📋 View Registered Attendees</span>
            <span>→</span>
          </Link>
        </div>

        {/* Basic Info */}
        <div style={cardStyle}>
          <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-5 pb-3 border-b border-gray-100">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label style={labelStyle}>Event Title</label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Date & Time</label>
              <input
                style={inputStyle}
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Location</label>
              <input
                style={inputStyle}
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Event Type</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Happened">Happened / Concluded</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
                value={form.desc}
                onChange={(e) => update("desc", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Registration Options Toggle */}
        <div style={cardStyle}>
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-5">
            <div>
              <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313]">
                Event Registration Mode
              </h3>
              <p className="font-body-md text-xs text-gray-500 mt-0.5">
                Choose how attendees sign up for this event.
              </p>
            </div>

            <div className="flex p-1 bg-[#f1edec] rounded-full border border-gray-200">
              <button
                type="button"
                onClick={() => setRegistrationType("form")}
                className={`px-4 py-1.5 rounded-full font-mono-label text-xs uppercase font-bold transition-all cursor-pointer ${
                  registrationType === "form"
                    ? "bg-[#131313] text-white shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                In-App Form
              </button>
              <button
                type="button"
                onClick={() => setRegistrationType("redirect")}
                className={`px-4 py-1.5 rounded-full font-mono-label text-xs uppercase font-bold transition-all cursor-pointer ${
                  registrationType === "redirect"
                    ? "bg-[#131313] text-white shadow-sm"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                External Link ↗
              </button>
            </div>
          </div>

          {registrationType === "redirect" ? (
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <label style={{ ...labelStyle, color: "#065f46" }}>
                External Registration URL (Google Form / Luma / Unstop / Devfolio)
              </label>
              <input
                style={{ ...inputStyle, background: "#ffffff", borderColor: "#a7f3d0" }}
                type="url"
                value={externalRegistrationUrl}
                onChange={(e) => setExternalRegistrationUrl(e.target.value)}
                placeholder="https://forms.gle/... or https://lu.ma/..."
                required={registrationType === "redirect"}
              />
              <p className="font-mono-label text-[11px] text-emerald-700 mt-2">
                When users click &quot;Register Now&quot; on the website, they will immediately open this external registration link in a new tab.
              </p>
            </div>
          ) : (
            <p className="font-mono-label text-xs text-gray-500">
              Attendees will fill out the custom in-app registration form defined below.
            </p>
          )}
        </div>

        {/* Custom Form Fields Editor (if In-App Form mode) */}
        {registrationType === "form" && (
          <FormFieldsEditor
            fields={form.formFields}
            onChange={(fields) => update("formFields", fields)}
          />
        )}

        {/* Form Actions */}
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
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
