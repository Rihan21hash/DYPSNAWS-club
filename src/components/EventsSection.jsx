"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import useRealtimeTable from "@/hooks/useRealtimeTable";

gsap.registerPlugin(ScrollTrigger);

// Fallback static data shown while loading or if DB is empty
const FALLBACK_EVENTS = [
  {
    id: "fallback-1",
    title: "Inauguration Ceremony and Expert Lecture",
    event_date: "2026-04-13",
    status: "happened",
  },
  {
    id: "fallback-2",
    title: "AWS Fundamentals Session",
    event_date: "2026-08-18",
    status: "upcoming",
  },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function EventsSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  const { data: liveEvents, loading } = useRealtimeTable("events", "/api/events");
  const events = liveEvents.length > 0 ? liveEvents : (loading ? [] : FALLBACK_EVENTS);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
        },
      });

      if (cardsRef.current && cardsRef.current.children.length > 0) {
        gsap.from(cardsRef.current.children, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 80%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, events.length]);

  const happened = events.filter((e) => e.status === "happened");
  const upcoming = events.filter((e) => e.status === "upcoming");

  return (
    <section
      ref={sectionRef}
      className="relative bg-white border-t border-gray-200/60 py-24 md:py-36"
      id="events"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-16">
        {/* Title */}
        <div ref={titleRef} className="text-center mb-16 md:mb-20">
          <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-xs uppercase tracking-widest text-gray-600 bg-[#fdf8f8] mb-4">
            03 / EVENTS
          </span>
          <h2 className="font-display-lg text-3xl sm:text-5xl md:text-6xl font-bold text-[#131313] tracking-tight mb-4">
            Events.
          </h2>
          <p className="font-body-md text-gray-600 max-w-lg mx-auto text-base">
            Our workshops, sessions, and community activities.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl p-6 md:p-8 bg-gray-100 animate-pulse"
                style={{ minHeight: "140px" }}
              />
            ))}
          </div>
        )}

        {/* Events Grid */}
        {!loading && (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Happened */}
            {happened.map((event) => (
              <div
                key={event.id}
                className="glass-panel rounded-xl p-6 md:p-8 bg-white border border-gray-200 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="font-mono-label text-[11px] text-emerald-600 font-bold uppercase tracking-widest">
                    Happened
                  </span>
                </div>
                <h3 className="font-headline-lg-mobile text-xl md:text-2xl font-bold text-[#131313] mb-3">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 font-mono-label text-xs text-gray-500">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  {event.event_date ? formatDate(event.event_date) : event.date}
                </div>
                {/* Decorative accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
              </div>
            ))}

            {/* Upcoming */}
            {upcoming.map((event) => {
              const isRedirect = Boolean(event.registrationType === "redirect" && event.externalRegistrationUrl);
              const regHref = isRedirect ? event.externalRegistrationUrl : `/events/${event.slug || "aws-fundamentals"}/register`;

              return (
                <div
                  key={event.id || event.slug}
                  className="glass-panel rounded-2xl p-6 md:p-8 bg-white border-2 border-[#131313]/20 shadow-sm relative overflow-hidden hover:border-[#131313]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
                        <span className="font-mono-label text-[11px] text-blue-600 font-bold uppercase tracking-widest">
                          Upcoming
                        </span>
                      </div>
                      {event.slug && (
                        <Link
                          href={`/events/${event.slug}`}
                          className="font-mono-label text-xs font-semibold text-gray-500 hover:text-black"
                        >
                          Details →
                        </Link>
                      )}
                    </div>
                    <h3 className="font-headline-lg-mobile text-xl md:text-2xl font-bold text-[#131313] mb-3">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 font-mono-label text-xs text-gray-500 mb-6">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      {event.event_date ? formatDate(event.event_date) : event.date}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <a
                      href={regHref}
                      target={isRedirect ? "_blank" : "_self"}
                      rel={isRedirect ? "noopener noreferrer" : undefined}
                      className="w-full py-2.5 px-4 rounded-full bg-[#131313] hover:bg-black text-white font-mono-label text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>{isRedirect ? "Register (External) ↗" : "Register Now"}</span>
                    </a>
                  </div>

                  {/* Decorative accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}

        {/* View all link */}
        {!loading && (
          <div className="text-center mt-12">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 font-mono-label text-xs tracking-widest text-gray-500 hover:text-[#131313] transition-colors border-b border-gray-300 hover:border-[#131313] pb-0.5"
            >
              VIEW ALL EVENTS →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
