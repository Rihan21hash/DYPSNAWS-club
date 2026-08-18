"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useRealtimeTable from "@/hooks/useRealtimeTable";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_TEAM = {
  captain: { name: "Tushar Kumbhar", role: "Captain" },
  technical: [
    { name: "Malhar Dhavale", role: "Technical Lead" },
    { name: "Kabir Wakarekar", role: "Technical Team" },
    { name: "Rajwardhan Patil", role: "Technical Team" },
    { name: "Rihan Mulla", role: "Technical Team" },
  ],
};

export default function TeamSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const listRef = useRef(null);

  const { data: liveMembers, loading } = useRealtimeTable("team_members", "/api/team");

  // Format captain & members from live list or fallback
  const captain = liveMembers?.find((m) =>
    m.role?.toLowerCase().includes("captain") ||
    m.name?.toLowerCase().includes("tushar")
  ) || (liveMembers && liveMembers.length > 0 ? liveMembers[0] : DEFAULT_TEAM.captain);

  const technicalMembers = liveMembers && liveMembers.length > 0
    ? liveMembers.filter((m) => m.id !== captain?.id)
    : DEFAULT_TEAM.technical;

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });

      if (listRef.current && listRef.current.children.length > 0) {
        gsap.from(listRef.current.children, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 85%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, liveMembers.length]);

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-36 bg-[#fdf8f8] border-t border-gray-200/60"
      id="team"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-16">
        {/* Header */}
        <div ref={titleRef} className="mb-16 md:mb-20 text-center max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-xs uppercase tracking-widest text-gray-600 bg-white mb-4">
            04 / THE TEAM
          </span>
          <h2 className="font-display-lg text-3xl sm:text-5xl md:text-6xl font-bold text-[#131313] tracking-tight">
            Our Team.
          </h2>
          <p className="mt-4 font-body-md text-base text-gray-600">
            The student leaders driving the AWS Student Builder Group at DYPSN.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Team List */}
        {!loading && (
          <div ref={listRef} className="max-w-3xl mx-auto flex flex-col gap-0">
            {/* Captain */}
            {captain && (
              <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-2 border-[#131313] pb-8 mb-8 group">
                <div className="flex gap-4 items-baseline">
                  <span className="font-mono-label text-sm text-gray-400 w-8 flex-shrink-0">
                    ★
                  </span>
                  <div>
                    <h3 className="font-display-lg text-2xl sm:text-3xl md:text-4xl font-bold text-[#131313] transform group-hover:translate-x-1.5 transition-transform duration-300">
                      {captain.name}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 sm:mt-0 pl-12 sm:pl-0">
                  <span className="px-4 py-1.5 bg-[#131313] text-white rounded-full font-mono-label text-xs font-bold uppercase">
                    {captain.role || "Captain"}
                  </span>
                </div>
              </div>
            )}

            {/* Technical Team Header */}
            {technicalMembers.length > 0 && (
              <div className="mb-6">
                <span className="font-mono-label text-xs uppercase tracking-widest text-gray-500 font-bold">
                  Core Members
                </span>
              </div>
            )}

            {/* Technical Team Members */}
            {technicalMembers.map((member, index) => {
              const numStr = (index + 1).toString().padStart(2, "0");
              return (
                <div
                  key={member.id || member.name}
                  className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 pb-6 mb-6 group hover:border-[#131313] transition-colors duration-300"
                >
                  <div className="flex gap-4 items-baseline">
                    <span className="font-mono-label text-sm text-gray-400 w-8 flex-shrink-0">
                      {numStr}
                    </span>
                    <h3 className="font-display-lg text-xl sm:text-2xl md:text-3xl font-bold text-[#131313] transform group-hover:translate-x-1.5 transition-transform duration-300">
                      {member.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0 pl-12 sm:pl-0">
                    <span className="px-3.5 py-1.5 border border-gray-300 rounded-full font-mono-label text-xs text-gray-700 bg-[#f7f3f2]">
                      {member.role || "Technical Team"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
