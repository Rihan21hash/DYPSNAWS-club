"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

/* ── Mobile Event Card ── */
function MobileEventCard({ event }) {
  const status = event.status || "Upcoming";
  const sc =
    status === "Completed"
      ? { c: "#22c55e", bg: "rgba(34,197,94,0.12)", b: "rgba(34,197,94,0.3)" }
      : status === "Ongoing"
      ? { c: "#AE5CFF", bg: "rgba(174,92,255,0.12)", b: "rgba(174,92,255,0.3)" }
      : { c: "#4a9eff", bg: "rgba(74,158,255,0.12)", b: "rgba(74,158,255,0.3)" };

  const accentColor = event.color || "#AE5CFF";

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block glass-card p-6 hover:scale-[1.02] hover:border-[#AE5CFF]/40 transition-all duration-300 relative"
      style={{ boxShadow: `0 0 25px ${accentColor}15` }}
    >
      {/* Status badge */}
      <span
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          padding: "3px 10px",
          borderRadius: "999px",
          fontSize: "9px",
          letterSpacing: "0.1em",
          fontWeight: 700,
          color: sc.c,
          background: sc.bg,
          border: `1px solid ${sc.b}`,
        }}
      >
        {status.toUpperCase()}
      </span>

      <span
        className="inline-block text-[10px] tracking-[0.2em] mb-2 font-bold uppercase"
        style={{ color: accentColor }}
      >
        {event.type}
      </span>
      <h3 className="text-lg font-extrabold text-white mb-2">{event.title}</h3>
      <div className="flex flex-wrap gap-4 text-xs text-white/50 mb-3 font-mono">
        <span>📅 {event.date}</span>
        {event.location && <span>📍 {event.location}</span>}
      </div>
      <p className="text-xs text-white/60 line-clamp-2">{event.desc}</p>
      <span
        className="inline-block mt-4 text-xs tracking-[0.15em] font-bold"
        style={{ color: accentColor }}
      >
        VIEW EVENT →
      </span>
    </Link>
  );
}

/* ── Desktop 3D Stack ── */
const Desktop3DStack = dynamic(() => import("./EventStack3DDesktop"), { ssr: false });

export default function EventStack3D({ events: propEvents }) {
  const [events, setEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetch("/api/events?featured=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setEvents(data);
      })
      .catch(() => {});
  }, []);

  if (isMobile === null) return null;

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40 text-sm">
        No events scheduled right now.
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="px-6 py-12 space-y-4 max-w-xl mx-auto">
        {events.map((event) => (
          <MobileEventCard key={event.slug} event={event} />
        ))}
        <div className="text-center pt-4">
          <Link
            href="/events"
            className="text-xs tracking-[0.2em] font-bold text-[#AE5CFF] hover:underline"
          >
            VIEW ALL EVENTS →
          </Link>
        </div>
      </div>
    );
  }

  return <Desktop3DStack events={events} />;
}
