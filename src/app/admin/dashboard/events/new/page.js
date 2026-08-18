"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  transition: "border-color 0.3s",
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
const EVENT_COLORS = ["#A855F7", "#7C3AED", "#9333EA", "#C084FC", "#8B5CF6", "#0073BB", "#10B981"];

export default function NewEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [registrationType, setRegistrationType] = useState("form"); // 'form' or 'redirect'
  const [externalRegistrationUrl, setExternalRegistrationUrl] = useState("");

  const [form, setForm] = useState({
    title: "",
    date: "",
    desc: "",
    type: "WORKSHOP",
    color: "#A855F7",
    location: "Panini Hall, DYPSN",
    capacity: 100,
    prerequisites: [""],
    schedule: [{ time: "11:00 AM", topic: "Introduction & Keynote" }],
    speakers: [{ name: "", role: "", topic: "" }],
    formFields: [
      { label: "Phone Number", type: "tel", required: true, options: "" },
      { label: "Department / Branch", type: "select", required: true, options: "Computer Science, AI & Data Science, Electronics, Mechanical, Civil" },
      { label: "Academic Year", type: "select", required: true, options: "1st Year, 2nd Year, 3rd Year, 4th Year" },
      { label: "College Roll No", type: "text", required: true, options: "" },
    ],
    featured: true,
    status: "Upcoming",
  });

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
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.push("/admin/dashboard/events");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create event");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      badge="02 / EVENTS"
      title="Create Event."
      subtitle="Publish a new event, workshop, or hackathon"
    >
      <form onSubmit={handleSubmit} className="max-w-[800px]">
        {error && (
          <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

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
                placeholder="e.g. AWS Cloud Mastery Workshop"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Date & Time</label>
              <input
                style={inputStyle}
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                placeholder="e.g. April 15, 2026 • 11:00 AM"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Location / Venue</label>
              <input
                style={inputStyle}
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Panini Hall, DYPSN"
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
              <label style={labelStyle}>Seat Capacity</label>
              <input
                style={inputStyle}
                type="number"
                value={form.capacity}
                onChange={(e) => update("capacity", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }}
                value={form.desc}
                onChange={(e) => update("desc", e.target.value)}
                placeholder="Detailed summary of what attendees will learn…"
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

        {/* Schedule Builder */}
        <div style={cardStyle}>
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
            <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313]">
              Schedule & Agenda
            </h3>
            <button
              type="button"
              onClick={() => update("schedule", [...form.schedule, { time: "", topic: "" }])}
              className="font-mono-label text-xs font-bold text-[#131313] hover:underline cursor-pointer"
            >
              + Add Slot
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {form.schedule.map((s, i) => (
              <div key={i} className="flex gap-3 items-center">
                <input
                  style={{ ...inputStyle, width: "140px" }}
                  value={s.time}
                  onChange={(e) => {
                    const arr = [...form.schedule];
                    arr[i].time = e.target.value;
                    update("schedule", arr);
                  }}
                  placeholder="11:00 AM"
                />
                <input
                  style={inputStyle}
                  value={s.topic}
                  onChange={(e) => {
                    const arr = [...form.schedule];
                    arr[i].topic = e.target.value;
                    update("schedule", arr);
                  }}
                  placeholder="Topic / Session description"
                />
                {form.schedule.length > 1 && (
                  <button
                    type="button"
                    onClick={() => update("schedule", form.schedule.filter((_, j) => j !== i))}
                    className="text-gray-400 hover:text-red-500 text-lg px-2 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

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
            {saving ? "Creating…" : "Publish Event"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
