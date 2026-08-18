"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import useRealtimeTable from "@/hooks/useRealtimeTable";

const transformMember = (row) => ({
  id: row.id,
  name: row.name,
  role: row.role,
  tagline: row.tagline,
  avatar: row.avatar,
  color: row.color,
  bio: row.bio || "",
  certifications: row.certifications || [],
  social: row.social || {},
});

export default function TeamRoster() {
  const { data: teamMembers } = useRealtimeTable("team_members", "/api/team", {
    transform: transformMember,
    filter: { column: "member_type", value: "core" },
  });
  const [selectedId, setSelectedId] = useState(null);
  const containerRef = useRef(null);
  const cardsRef = useRef({});
  const overlayRef = useRef(null);
  const detailRef = useRef(null);

  const selected = teamMembers.find((m) => m.id === selectedId);

  useEffect(() => {
    if (teamMembers.length === 0) return;
    const cards = Object.values(cardsRef.current).filter(Boolean);
    cards.forEach((card, i) => {
      gsap.to(card, {
        y: "random(-15, 15)",
        x: "random(-8, 8)",
        rotation: "random(-3, 3)",
        duration: "random(3, 5)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.3,
      });
    });
  }, [teamMembers]);

  const handleSelect = (member) => {
    setSelectedId(member.id);

    gsap.fromTo(
      overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: "power2.out" }
    );

    gsap.fromTo(
      detailRef.current,
      { opacity: 0, scale: 0.85, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)", delay: 0.1 }
    );
  };

  const handleClose = () => {
    gsap.to(detailRef.current, {
      opacity: 0,
      scale: 0.9,
      y: 30,
      duration: 0.3,
      ease: "power2.in",
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => setSelectedId(null),
    });
  };

  const getOrbitStyle = (index, total) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    const radiusX = typeof window !== "undefined" && window.innerWidth < 768 ? 30 : 35;
    const radiusY = typeof window !== "undefined" && window.innerWidth < 768 ? 30 : 28;
    const x = 50 + radiusX * Math.cos(angle);
    const y = 50 + radiusY * Math.sin(angle);
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: "translate(-50%, -50%)",
    };
  };

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Floating cards in orbit */}
      <div className="relative w-full h-[80vh] md:h-[85vh]">
        {teamMembers.map((member, index) => {
          const mColor = member.color || "#AE5CFF";
          return (
            <div
              key={member.id}
              ref={(el) => (cardsRef.current[member.id] = el)}
              className="absolute cursor-pointer group"
              style={getOrbitStyle(index, teamMembers.length)}
              onClick={() => handleSelect(member)}
            >
              <div className="glass-card p-5 md:p-6 w-[180px] md:w-[220px] transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(174,92,255,0.25)] group-hover:scale-105 group-hover:border-[#AE5CFF]/40">
                {/* Avatar */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-base font-extrabold text-white mb-4 transition-transform duration-500 group-hover:scale-110 border border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${mColor}, ${mColor}88)`,
                    boxShadow: `0 0 25px ${mColor}33`,
                  }}
                >
                  {member.avatar}
                </div>

                {/* Name */}
                <h3 className="text-sm font-extrabold text-white mb-0.5 truncate">
                  {member.name}
                </h3>
                <p className="text-xs text-[#AE5CFF] font-semibold">{member.role}</p>

                {/* Expand hint */}
                <div className="mt-3 h-px w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-[#AE5CFF] to-transparent" />
              </div>
            </div>
          );
        })}

        {/* Center label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-xs tracking-[0.3em] font-semibold text-[#AE5CFF]/40 block mb-2">
            CLICK TO
          </span>
          <span className="text-sm tracking-[0.2em] font-bold text-white/50">
            EXPLORE
          </span>
        </div>
      </div>

      {/* Expanded Detail Overlay */}
      {selectedId && selected && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-[#020B18]/80 backdrop-blur-xl"
            onClick={handleClose}
          />

          <div
            ref={detailRef}
            className="relative z-10 w-full max-w-lg glass-card p-8 md:p-10 overflow-y-auto max-h-[85vh]"
            style={{ boxShadow: `0 0 60px ${(selected.color || "#AE5CFF")}30` }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-[#AE5CFF] transition-all"
            >
              ✕
            </button>

            {/* Avatar large */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-6 border border-white/10"
              style={{
                background: `linear-gradient(135deg, ${selected.color || "#AE5CFF"}, ${selected.color || "#AE5CFF"}88)`,
                boxShadow: `0 0 40px ${selected.color || "#AE5CFF"}40`,
              }}
            >
              {selected.avatar}
            </div>

            {/* Name & Role */}
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
              {selected.name}
            </h2>
            <p className="text-sm text-[#AE5CFF] font-bold mb-2">
              {selected.role}
            </p>
            <p className="text-xs text-white/50 italic mb-6">
              &ldquo;{selected.tagline}&rdquo;
            </p>

            <div
              className="h-px w-full mb-6"
              style={{
                background: `linear-gradient(90deg, ${(selected.color || "#AE5CFF")}50, transparent)`,
              }}
            />

            {/* Bio */}
            <h4 className="text-xs tracking-[0.2em] font-semibold text-[#AE5CFF] mb-3 uppercase">
              ABOUT
            </h4>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              {selected.bio}
            </p>

            {/* Certifications */}
            <h4 className="text-xs tracking-[0.2em] font-semibold text-[#AE5CFF] mb-3 uppercase">
              AWS CERTIFICATIONS
            </h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {selected.certifications.map((cert) => (
                <span
                  key={cert}
                  className="px-3 py-1.5 text-xs rounded-full border text-white/80 bg-[#AE5CFF]/10 border-[#AE5CFF]/30"
                >
                  ☁️ {cert}
                </span>
              ))}
            </div>

            {/* Social Links */}
            <h4 className="text-xs tracking-[0.2em] font-semibold text-[#AE5CFF] mb-3 uppercase">
              CONNECT
            </h4>
            <div className="flex gap-3">
              {Object.entries(selected.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs text-white/60 hover:text-[#AE5CFF] border border-white/10 hover:border-[#AE5CFF]/40 rounded-full transition-all duration-300 capitalize"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
