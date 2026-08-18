"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useRealtimeTable from "@/hooks/useRealtimeTable";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_CERTS = [
  { id: "f1", title: "AWS Certified Cloud Practitioner", level: "Foundational", code: "CLF-C02" },
  { id: "f2", title: "AWS Certified AI Practitioner", level: "Foundational", code: "AIF-C01" },
  { id: "f3", title: "AWS Certified Solutions Architect – Associate", level: "Associate", code: "SAA-C03" },
];

export default function CertificationsSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  const { data: liveCerts, loading } = useRealtimeTable("certifications", "/api/certifications");
  const rawCerts = liveCerts.length > 0 ? liveCerts : loading ? [] : FALLBACK_CERTS;
  const FEATURED_CERTS = rawCerts.slice(0, 3);

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

      if (cardsRef.current && cardsRef.current.children.length > 0) {
        gsap.from(cardsRef.current.children, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 85%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading]);

  const iconForCert = (name) => {
    if (!name) return "cloud";
    if (name.toLowerCase().includes("architect")) return "architecture";
    if (name.toLowerCase().includes("ai")) return "smart_toy";
    return "cloud";
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-36 bg-white border-t border-gray-200/60"
      id="certifications"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-16">
        <div ref={titleRef} className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-xs uppercase tracking-widest text-gray-600 bg-[#fdf8f8] mb-4">
            05 / CERTIFICATIONS
          </span>
          <h2 className="font-display-lg text-3xl sm:text-5xl md:text-6xl font-bold text-[#131313] tracking-tight mb-4">
            Certifications.
          </h2>
          <p className="font-body-md text-gray-600 max-w-lg mx-auto mb-6 text-base">
            We guide and support students through official AWS certification pathways.
          </p>
          <Link
            href="/certifications"
            className="inline-flex items-center gap-2 font-mono-label text-xs font-bold text-[#131313] hover:underline underline-offset-4"
          >
            VIEW ALL CERTIFICATIONS →
          </Link>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl p-8 bg-gray-100 animate-pulse" style={{ minHeight: "180px" }} />
            ))}
          </div>
        )}

        {/* Featured Certs Grid — only 3 */}
        {!loading && (
          <div
            ref={cardsRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto"
          >
            {FEATURED_CERTS.map((cert) => (
              <Link
                href="/certifications"
                key={cert.id || cert.code}
                className="glass-panel rounded-xl p-6 md:p-8 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-black/30 transition-all duration-300 group flex flex-col"
              >
                {/* Top row */}
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-[#f1edec] rounded-lg flex items-center justify-center text-[#0073BB] group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined text-[24px]">
                      {iconForCert(cert.title || cert.name)}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-[#f1edec] border border-gray-200 rounded-full font-mono-label text-[10px] text-gray-600 uppercase font-bold">
                    {cert.level}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-body-lg text-lg font-bold text-[#131313] mb-4 flex-grow group-hover:text-black">
                  {cert.title || cert.name}
                </h3>

                {/* Metadata */}
                <div className="pt-4 border-t border-gray-100 font-mono-label text-xs flex justify-between items-center">
                  <span className="text-gray-400 uppercase">CODE</span>
                  <span className="text-[#131313] font-bold">{cert.code}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
