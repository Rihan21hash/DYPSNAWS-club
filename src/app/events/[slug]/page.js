"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SmoothScroller from "@/components/SmoothScroller";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

/* ── RSVP Button Component ── */
function RSVPButton({ eventSlug, event, className = "" }) {
  const router = useRouter();
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const { user } = useAuth();

  const isExternal = Boolean(
    event?.registrationType === "redirect" || event?.externalRegistrationUrl
  );
  const externalUrl = event?.externalRegistrationUrl;

  useEffect(() => {
    if (isExternal) {
      setStatus("external");
      return;
    }
    setStatus("loading");
    fetch(`/api/registrations/${eventSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.authenticated) setStatus("unauthenticated");
        else if (data.registered) setStatus("registered");
        else setStatus("unregistered");
      })
      .catch(() => setStatus("unauthenticated"));
  }, [eventSlug, user, isExternal]);

  const handleGoToForm = () => {
    router.push(`/events/${eventSlug}/register`);
  };

  const handleCancel = async () => {
    setStatus("loading");
    const res = await fetch(`/api/registrations/${eventSlug}`, { method: "DELETE" });
    if (res.ok) setStatus("unregistered");
    else setStatus("registered");
  };

  const btnBase = `group relative inline-flex items-center justify-center px-8 py-3.5 text-xs font-mono-label font-bold uppercase tracking-widest rounded-full transition-all duration-300 ${className}`;

  if (isExternal && externalUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnBase} text-white bg-[#131313] hover:bg-black shadow-sm hover:scale-[1.02] cursor-pointer`}
      >
        <span className="flex items-center gap-2">
          Register (External) ↗
        </span>
      </a>
    );
  }

  if (status === "loading") {
    return (
      <span className={`${btnBase} text-gray-400 border border-gray-200 cursor-wait bg-gray-50`}>
        Checking…
      </span>
    );
  }

  if (status === "registered") {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <span className={`${btnBase} text-white bg-emerald-600 shadow-sm`}>
          ✓ Registered
        </span>
        <button
          onClick={handleCancel}
          className="font-mono-label text-xs font-bold text-red-500 hover:text-red-700 uppercase cursor-pointer"
        >
          Cancel Registration
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={
          status === "unauthenticated"
            ? () => router.push(`/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "")}`)
            : handleGoToForm
        }
        className={`${btnBase} text-white bg-[#131313] hover:bg-black shadow-sm hover:scale-[1.02] cursor-pointer flex items-center gap-2`}
      >
        {status === "unauthenticated" && (
          <span className="material-symbols-outlined text-[16px]">login</span>
        )}
        <span>{status === "unauthenticated" ? "Sign In to RSVP" : "Register For Event"}</span>
      </button>
      {error && <span className="font-mono-label text-xs text-red-500">{error}</span>}
    </div>
  );
}

export default function EventDetailPage() {
  const params = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${params.slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setEvent(data);
      })
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8f8] flex items-center justify-center font-mono-label text-xs text-gray-400">
        Loading event details…
      </div>
    );
  }

  if (!event) {
    return (
      <SmoothScroller>
        <PageTransition>
          <div className="min-h-screen bg-[#fdf8f8] flex flex-col items-center justify-center px-4 text-[#1c1b1b]">
            <h1 className="font-display text-2xl font-bold mb-3">Event Not Found</h1>
            <p className="font-body-md text-sm text-gray-500 mb-6">
              The event you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/events"
              className="px-6 py-2.5 rounded-full bg-[#131313] text-white font-mono-label text-xs font-bold uppercase"
            >
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
          <main className="max-w-[1200px] mx-auto px-5 md:px-12 py-12 sm:py-16 w-full flex-1">
            {/* Back link */}
            <Link
              href="/events"
              className="inline-flex items-center gap-2 font-mono-label text-xs uppercase tracking-widest text-gray-500 hover:text-black transition-colors mb-8"
            >
              ← Back to all events
            </Link>

            {/* Event Header Hero Card */}
            <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-10 md:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.02)] mb-10 relative overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-[11px] uppercase tracking-widest text-gray-600 bg-[#f1edec]">
                  02 / EVENT DETAILS
                </span>
                <span className="px-3 py-1 bg-[#f7f3f2] border border-gray-200 rounded-full font-mono-label text-[11px] uppercase font-bold text-gray-700">
                  {event.type || "Workshop"}
                </span>
                <span className={`px-3 py-1 rounded-full font-mono-label text-[11px] uppercase font-bold ${
                  event.status?.toLowerCase() === "happened"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {event.status || "Upcoming"}
                </span>
              </div>

              <h1 className="font-display-xl text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#131313] tracking-tight mb-6 leading-tight max-w-4xl">
                {event.title}
              </h1>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl">
                <div className="p-4 rounded-2xl bg-[#f7f3f2] border border-gray-200/80">
                  <span className="font-mono-label text-[10px] uppercase tracking-wider text-gray-500 block mb-1">
                    Date & Time
                  </span>
                  <span className="font-body-lg text-sm font-bold text-[#131313]">
                    {event.date}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#f7f3f2] border border-gray-200/80">
                  <span className="font-mono-label text-[10px] uppercase tracking-wider text-gray-500 block mb-1">
                    Location
                  </span>
                  <span className="font-body-lg text-sm font-bold text-[#131313]">
                    {event.location || "DYPSN Campus"}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#f7f3f2] border border-gray-200/80">
                  <span className="font-mono-label text-[10px] uppercase tracking-wider text-gray-500 block mb-1">
                    Seat Capacity
                  </span>
                  <span className="font-body-lg text-sm font-bold text-[#131313]">
                    {event.capacity || 100} Attendees
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="font-body-lg text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mb-8">
                {event.desc}
              </p>

              {/* Top RSVP Button */}
              {event.status?.toLowerCase() !== "happened" && (
                <div className="pt-4 border-t border-gray-100">
                  <RSVPButton eventSlug={event.slug} event={event} />
                </div>
              )}
            </div>

            {/* Schedule & Agenda Section */}
            {event.schedule && event.schedule.length > 0 && (
              <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.02)] mb-10">
                <h2 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-6 pb-4 border-b border-gray-100">
                  Agenda & Timeline
                </h2>
                <div className="flex flex-col gap-3">
                  {event.schedule.map((item, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-[#f7f3f2] border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <span className="font-body-lg text-sm font-bold text-[#131313]">
                        {item.topic}
                      </span>
                      <span className="font-mono-label text-xs font-bold text-gray-600 px-3 py-1 bg-white border border-gray-200 rounded-full w-fit">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prerequisites & Speakers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Prerequisites */}
              {event.prerequisites && event.prerequisites.length > 0 && (
                <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                  <h2 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-6 pb-4 border-b border-gray-100">
                    Prerequisites
                  </h2>
                  <ul className="space-y-3">
                    {event.prerequisites.map((prereq, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-600 font-body-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#131313] mt-2 flex-shrink-0" />
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Speakers */}
              {event.speakers && event.speakers.length > 0 && (
                <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                  <h2 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-6 pb-4 border-b border-gray-100">
                    Featured Speakers
                  </h2>
                  <div className="space-y-4">
                    {event.speakers.map((speaker, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-[#f7f3f2] border border-gray-200/80">
                        <h3 className="font-body-lg text-sm font-bold text-[#131313]">
                          {speaker.name}
                        </h3>
                        <p className="font-mono-label text-xs text-purple-700 font-semibold mb-1">
                          {speaker.role}
                        </p>
                        {speaker.topic && (
                          <p className="font-body-md text-xs text-gray-500">
                            Topic: {speaker.topic}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Event Images / Gallery */}
            {event.images && event.images.length > 0 && (
              <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.02)] mb-10">
                <h2 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-6 pb-4 border-b border-gray-100">
                  Event Gallery
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {event.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${event.title} ${i + 1}`}
                      className="w-full h-48 object-cover rounded-2xl border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Bottom CTA Card */}
            {event.status?.toLowerCase() !== "happened" && (
              <div className="bg-white border border-gray-200/90 rounded-3xl p-8 sm:p-12 text-center shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#131313] mb-3">
                  Ready to Attend?
                </h2>
                <p className="font-body-md text-sm text-gray-600 max-w-md mx-auto mb-8">
                  Reserve your seat now. Capacity is limited to {event.capacity || 100} attendees.
                </p>
                <div className="flex justify-center">
                  <RSVPButton eventSlug={event.slug} event={event} />
                </div>
              </div>
            )}
          </main>

          <Footer />
        </div>
      </PageTransition>
    </SmoothScroller>
  );
}
