"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import SmoothScroller from "@/components/SmoothScroller";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import useRealtimeTable from "@/hooks/useRealtimeTable";

const FALLBACK_EVENTS = [
  {
    id: "fb-1",
    title: "Inauguration Ceremony and Expert Lecture",
    event_date: "2026-04-13",
    description:
      "The official inauguration of the AWS Student Builder Group at DYPSN, featuring an expert lecture on cloud computing fundamentals and the future of AWS in education.",
    status: "happened",
    location: "DYPSN Campus",
  },
  {
    id: "fb-2",
    title: "AWS Fundamentals Session",
    event_date: "2026-08-18",
    description:
      "A hands-on session covering core AWS services including EC2, S3, IAM, and VPC. Learn the fundamentals of cloud architecture and deploy your first resources.",
    status: "upcoming",
    location: "DYPSN Campus",
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

export default function EventsPageClient() {
  const [filter, setFilter] = useState("ALL");
  const listRef = useRef(null);
  const { data: liveEvents, loading } = useRealtimeTable("events", "/api/events");
  const EVENTS = liveEvents.length > 0 ? liveEvents : (loading ? [] : FALLBACK_EVENTS);

  useEffect(() => {
    if (loading || !listRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(listRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, listRef);

    return () => ctx.revert();
  }, [filter, loading]);

  const happened = EVENTS.filter((e) => e.status === "happened");
  const upcoming = EVENTS.filter((e) => e.status === "upcoming");

  const getFiltered = () => {
    if (filter === "ALL") return EVENTS;
    if (filter === "HAPPENED") return happened;
    if (filter === "UPCOMING") return upcoming;
    return EVENTS;
  };

  const filtered = getFiltered();

  return (
    <SmoothScroller>
      <PageTransition>
        <div className="bg-[#fdf8f8] min-h-screen flex flex-col pt-20 text-[#1c1b1b]">
          {/* Main Content */}
          <main className="flex-grow flex flex-col w-full max-w-[1440px] mx-auto px-5 md:px-16 pt-16 md:pt-24 pb-24">
            {/* Header */}
            <header className="grid grid-cols-12 gap-8 mb-16 md:mb-20">
              <div className="col-span-12 md:col-span-8 md:col-start-3 text-center md:text-left">
                <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-xs text-gray-600 mb-4 uppercase tracking-widest bg-[#f1edec]">
                  Community Events
                </span>
                <h1 className="font-display-xl text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#131313] mb-6 font-extrabold tracking-tight">
                  Events &
                  <br />
                  Sessions.
                </h1>
                <p className="font-body-lg text-base sm:text-lg text-gray-600 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  Our workshops, sessions, and community activities — both past and upcoming.
                </p>
                <div className="h-px bg-gray-200 w-full mt-10 md:mt-12" />
              </div>
            </header>

            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-12 max-w-[1440px] mx-auto w-full">
              {["ALL", "HAPPENED", "UPCOMING"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`font-mono-label text-xs px-4 py-1.5 rounded-full border transition-all cursor-pointer ${
                    filter === t
                      ? "bg-[#131313] text-white border-[#131313] font-bold"
                      : "bg-white/80 text-gray-600 border-gray-300 hover:border-black/50"
                  }`}
                >
                  {t === "ALL" ? `All (${EVENTS.length})` : t === "HAPPENED" ? `Happened (${happened.length})` : `Upcoming (${upcoming.length})`}
                </button>
              ))}
            </div>

            {/* Events List */}
            <section className="grid grid-cols-12 gap-8 relative">
              {/* Visual Track (Desktop) */}
              <div className="hidden md:block col-span-2 relative border-r border-gray-200 pt-8 pb-32" />

              {/* Events Container */}
              <div
                ref={listRef}
                className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col gap-10 relative pt-2"
              >
                {loading && (
                  <div className="flex flex-col gap-8">
                    {[1, 2].map((i) => (
                      <div key={i} className="rounded-xl p-8 bg-gray-100 animate-pulse" style={{ minHeight: "140px" }} />
                    ))}
                  </div>
                )}
                {!loading && filtered.map((event, index) => {
                  const isUpcoming = event.status === "upcoming";

                  return (
                    <div key={event.id || event.title} className="relative group">
                      {/* Status Track Dot */}
                      <div
                        className={`absolute -left-[53px] md:-left-[calc(16.666%_+_16px)] top-8 rounded-full border-2 border-white hidden md:block transition-colors ${
                          isUpcoming
                            ? "w-4 h-4 bg-blue-500 animate-pulse z-10 -ml-0.5"
                            : "w-3.5 h-3.5 bg-emerald-500 group-hover:bg-black"
                        }`}
                      />

                      {/* Event Card */}
                      <div
                        className={`glass-panel p-6 md:p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden bg-white border ${
                          isUpcoming
                            ? "border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/30"
                            : "border-gray-200"
                        }`}
                      >
                        {isUpcoming && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
                        )}
                        {!isUpcoming && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
                        )}

                        <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative z-10">
                          {/* Date & Meta Column */}
                          <div className="flex flex-col gap-2 min-w-[130px]">
                            {isUpcoming ? (
                              <span className="font-mono-label text-[11px] text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded inline-flex items-center w-max mb-1 border border-blue-200/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse" />
                                UPCOMING
                              </span>
                            ) : (
                              <span className="font-mono-label text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded inline-flex items-center w-max mb-1 border border-emerald-200/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                HAPPENED
                              </span>
                            )}

                            <div className="flex items-center gap-1.5 font-mono-label text-sm text-gray-600 mt-2">
                              <span className="material-symbols-outlined text-[16px]">
                                calendar_today
                              </span>
                              {event.event_date ? formatDate(event.event_date) : event.date}
                            </div>
                          </div>

                          {/* Content Column */}
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <h3 className="font-headline-lg-mobile text-xl sm:text-2xl font-bold text-[#131313] mb-3 group-hover:text-black transition-colors">
                                {event.title}
                              </h3>
                              <p className="font-body-md text-sm text-gray-600 mb-4 max-w-xl leading-relaxed">
                                {event.description}
                              </p>

                              {/* Tags & Action Buttons */}
                              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                  {event.type && (
                                    <span className="px-2.5 py-1 bg-[#f1edec] text-gray-700 font-mono-label text-xs rounded-full border border-gray-200">
                                      {event.type}
                                    </span>
                                  )}
                                  {event.location && (
                                    <span className="px-2.5 py-1 bg-[#f1edec] text-gray-700 font-mono-label text-xs rounded-full border border-gray-200">
                                      {event.location}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  {event.slug && (
                                    <Link
                                      href={`/events/${event.slug}`}
                                      className="font-mono-label text-xs font-bold text-gray-600 hover:text-black transition-colors"
                                    >
                                      Details →
                                    </Link>
                                  )}

                                  {isUpcoming && (
                                    event.registrationType === "redirect" && event.externalRegistrationUrl ? (
                                      <a
                                        href={event.externalRegistrationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-5 py-2 rounded-full bg-[#131313] hover:bg-black text-white font-mono-label text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-sm"
                                      >
                                        Register ↗
                                      </a>
                                    ) : (
                                      <Link
                                        href={`/events/${event.slug || "aws-fundamentals"}/register`}
                                        className="px-5 py-2 rounded-full bg-[#131313] hover:bg-black text-white font-mono-label text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-sm"
                                      >
                                        Register Now
                                      </Link>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>

          <Footer />
        </div>
      </PageTransition>
    </SmoothScroller>
  );
}
