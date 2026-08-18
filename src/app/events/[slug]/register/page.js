"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import SmoothScroller from "@/components/SmoothScroller";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: "12px",
  background: "#f7f3f2",
  border: "1px solid #e5e7eb",
  color: "#131313",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s, background-color 0.2s",
};

export default function EventRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.replace(`/login?next=${encodeURIComponent(`/events/${params.slug}/register`)}`);
          return;
        }
        setUser(authUser);

        const evRes = await fetch(`/api/events/${params.slug}`);
        if (!evRes.ok) {
          setLoading(false);
          return;
        }
        const ev = await evRes.json();
        setEvent(ev);

        // If redirect type, redirect immediately to external link
        if (ev.registrationType === "redirect" && ev.externalRegistrationUrl) {
          window.location.href = ev.externalRegistrationUrl;
          return;
        }

        // Check registration status
        const regRes = await fetch(`/api/registrations/${params.slug}`);
        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData.registered) setAlreadyRegistered(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.slug, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: params.slug,
          formData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fields = event?.formFields || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f8] flex items-center justify-center text-gray-500 font-mono-label text-xs">
        Loading event registration…
      </div>
    );
  }

  if (!event) {
    return (
      <SmoothScroller>
        <PageTransition>
          <div className="min-h-screen bg-[#fdf8f8] flex flex-col items-center justify-center px-4">
            <h1 className="font-display text-2xl font-bold text-[#131313] mb-3">Event Not Found</h1>
            <Link href="/events" className="font-mono-label text-xs font-bold text-gray-600 hover:text-black">
              ← Back to Events
            </Link>
          </div>
        </PageTransition>
      </SmoothScroller>
    );
  }

  return (
    <SmoothScroller>
      <PageTransition>
        <div className="bg-[#fdf8f8] min-h-screen flex flex-col pt-20 text-[#1c1b1b]">
          <main className="max-w-[720px] mx-auto px-5 py-12 sm:py-16 w-full flex-1">
            {/* Back link */}
            <Link
              href={`/events/${params.slug}`}
              className="inline-flex items-center gap-2 font-mono-label text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-8"
            >
              ← Back to Event Overview
            </Link>

            {/* Event Meta Header */}
            <div className="mb-8">
              <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-[11px] uppercase tracking-widest text-gray-600 bg-[#f1edec] mb-3">
                02 / REGISTRATION
              </span>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-[#131313] tracking-tight mb-2">
                {event.title}
              </h1>
              <div className="flex flex-wrap gap-4 font-mono-label text-xs text-gray-500 mt-2">
                <span>📅 {event.date}</span>
                <span>📍 {event.location}</span>
                <span>👥 {event.capacity} Seats</span>
              </div>
            </div>

            {/* External Redirect Notice if redirect type */}
            {event.registrationType === "redirect" && event.externalRegistrationUrl && (
              <div className="bg-white border border-emerald-300 rounded-2xl p-8 text-center shadow-sm mb-8">
                <h2 className="font-display text-xl font-bold text-[#131313] mb-2">
                  External Registration Platform
                </h2>
                <p className="font-body-md text-sm text-gray-600 mb-6">
                  Registration for this event is being handled through an official external form.
                </p>
                <a
                  href={event.externalRegistrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#131313] hover:bg-black text-white font-mono-label text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <span>Open Registration Form ↗</span>
                </a>
              </div>
            )}

            {/* Already Registered Card */}
            {alreadyRegistered && !success && (
              <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  ✓
                </div>
                <h2 className="font-display text-xl font-bold text-[#131313] mb-2">
                  You are registered for this event!
                </h2>
                <p className="font-body-md text-sm text-gray-600 mb-6">
                  Your seat has been reserved. Check your email for further instructions and updates.
                </p>
                <Link
                  href={`/events/${params.slug}`}
                  className="inline-flex items-center gap-2 font-mono-label text-xs font-bold text-black hover:underline"
                >
                  ← Back to Event Page
                </Link>
              </div>
            )}

            {/* Success Card */}
            {success && (
              <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                  🎉
                </div>
                <h2 className="font-display text-2xl font-bold text-[#131313] mb-2">
                  Registration Confirmed!
                </h2>
                <p className="font-body-md text-sm text-gray-600 mb-6">
                  You are now registered for <strong>{event.title}</strong>. See you at the session!
                </p>
                <Link
                  href={`/events/${params.slug}`}
                  className="inline-flex px-8 py-3.5 rounded-full bg-[#131313] hover:bg-black text-white font-mono-label text-xs font-bold uppercase tracking-wider transition-all"
                >
                  View Event Page
                </Link>
              </div>
            )}

            {/* In-App Custom Registration Form */}
            {!alreadyRegistered && !success && event.registrationType !== "redirect" && (
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                {error && (
                  <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Auto-filled user information */}
                  <div className="p-4 bg-[#f7f3f2] rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="font-body-lg text-sm font-bold text-[#131313]">
                        {user?.user_metadata?.full_name || user?.email}
                      </div>
                      <div className="font-mono-label text-xs text-gray-500">
                        {user?.email}
                      </div>
                    </div>
                    <span className="font-mono-label text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Logged In
                    </span>
                  </div>

                  {/* Dynamic Custom Questions */}
                  {fields.map((f, i) => {
                    const label = f.label;
                    const isRequired = f.required !== false;
                    const type = f.type || "text";

                    return (
                      <div key={i}>
                        <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                          {label} {isRequired && <span className="text-red-500">*</span>}
                        </label>

                        {type === "select" ? (
                          <select
                            style={{ ...inputStyle, cursor: "pointer" }}
                            required={isRequired}
                            value={formData[label] || ""}
                            onChange={(e) =>
                              setFormData((p) => ({ ...p, [label]: e.target.value }))
                            }
                          >
                            <option value="">Select option…</option>
                            {(f.options || "")
                              .split(",")
                              .map((opt) => opt.trim())
                              .filter(Boolean)
                              .map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                          </select>
                        ) : type === "textarea" ? (
                          <textarea
                            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                            required={isRequired}
                            value={formData[label] || ""}
                            onChange={(e) =>
                              setFormData((p) => ({ ...p, [label]: e.target.value }))
                            }
                            placeholder={`Enter ${label}…`}
                          />
                        ) : (
                          <input
                            style={inputStyle}
                            type={type === "tel" ? "tel" : type === "number" ? "number" : "text"}
                            required={isRequired}
                            value={formData[label] || ""}
                            onChange={(e) =>
                              setFormData((p) => ({ ...p, [label]: e.target.value }))
                            }
                            placeholder={`Enter ${label}…`}
                          />
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-4 py-4 px-8 rounded-full bg-[#131313] hover:bg-black text-white font-mono-label text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.01] shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting && (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {submitting ? "Submitting Registration…" : "Complete Registration"}
                  </button>
                </form>
              </div>
            )}
          </main>

          <Footer />
        </div>
      </PageTransition>
    </SmoothScroller>
  );
}
