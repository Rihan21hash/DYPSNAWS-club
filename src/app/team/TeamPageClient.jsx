"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroller from "@/components/SmoothScroller";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import useRealtimeTable from "@/hooks/useRealtimeTable";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_MEMBERS = [
  { name: "Tushar Kumbhar", role: "Captain" },
  { name: "Malhar Dhavale", role: "Technical Team" },
  { name: "Kabir Wakarekar", role: "Technical Team" },
  { name: "Rajwardhan Patil", role: "Technical Team" },
  { name: "Rihan Mulla", role: "Technical Team" },
];

export default function TeamPageClient() {
  const listRef = useRef(null);
  const { data: liveMembers, loading } = useRealtimeTable("team_members", "/api/team");

  const membersToRender =
    liveMembers && liveMembers.length > 0
      ? liveMembers
      : loading
      ? []
      : DEFAULT_MEMBERS;

  useEffect(() => {
    if (loading || !listRef.current || membersToRender.length === 0) return;
    const ctx = gsap.context(() => {
      gsap.from(listRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, listRef);

    return () => ctx.revert();
  }, [loading, membersToRender.length]);

  return (
    <SmoothScroller>
      <PageTransition>
        <div className="bg-[#fdf8f8] min-h-screen flex flex-col pt-20 text-[#1c1b1b]">
          {/* Main Content */}
          <main className="flex-grow pt-16 md:pt-24 pb-24 px-5 md:px-16 max-w-[1440px] mx-auto w-full">
            {/* Hero Section */}
            <section className="grid grid-cols-12 gap-8 mb-16 md:mb-20">
              <div className="col-span-12 md:col-span-8">
                <div className="font-mono-label text-xs uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#131313] animate-pulse" />
                  The Team
                </div>
                <h1 className="font-display-xl text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#131313] mb-6 font-extrabold tracking-tight">
                  Our Team.
                </h1>
                <p className="font-body-lg text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed">
                  The student leaders driving the AWS Student Builder Group at
                  DYPSN. A clean ledger of the individuals engineering
                  excellence.
                </p>
              </div>
            </section>

            {/* Editorial Divider */}
            <div className="w-full h-px bg-gray-200 mb-12 md:mb-16" />

            {/* Loading Skeleton */}
            {loading && (
              <div className="max-w-3xl mx-auto flex flex-col gap-6 mb-24">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-gray-100/70 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {/* Team List (Editorial Ledger) */}
            {!loading && (
              <section className="grid grid-cols-12 gap-8 mb-24">
                <div
                  ref={listRef}
                  className="col-span-12 md:col-span-10 md:col-start-2 flex flex-col gap-6"
                >
                  {membersToRender.map((member, index) => {
                    const isCaptain =
                      member.role?.toLowerCase().includes("captain") ||
                      member.name?.toLowerCase().includes("tushar") ||
                      index === 0;

                    const numStr = isCaptain
                      ? "★"
                      : (index).toString().padStart(2, "0");

                    return (
                      <div
                        key={member.id || member.name}
                        className={`flex flex-col md:flex-row md:items-end justify-between pb-8 group hover:border-[#131313] transition-colors duration-300 gap-4 ${
                          isCaptain
                            ? "border-b-2 border-[#131313]"
                            : "border-b border-gray-200"
                        }`}
                      >
                        <div className="flex gap-4 md:gap-6 items-baseline">
                          <span className="font-mono-label text-xs sm:text-sm text-gray-400 w-8 flex-shrink-0">
                            {numStr}
                          </span>
                          <div>
                            <h2
                              className={`font-display-lg font-bold text-[#131313] transform group-hover:translate-x-1.5 transition-transform duration-300 ${
                                isCaptain
                                  ? "text-3xl sm:text-4xl md:text-5xl"
                                  : "text-2xl sm:text-3xl md:text-4xl"
                              }`}
                            >
                              {member.name}
                            </h2>
                            {member.tagline && (
                              <p className="text-xs text-gray-500 font-mono-label mt-1">
                                {member.tagline}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-start md:self-auto pl-12 md:pl-0">
                          {isCaptain ? (
                            <span className="px-4 py-1.5 bg-[#131313] text-white rounded-full font-mono-label text-xs font-bold uppercase">
                              {member.role || "Captain"}
                            </span>
                          ) : (
                            <span className="px-3.5 py-1.5 border border-gray-300 rounded-full font-mono-label text-xs text-gray-700 bg-[#f7f3f2]">
                              {member.role || "Team Member"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </main>

          <Footer />
        </div>
      </PageTransition>
    </SmoothScroller>
  );
}
