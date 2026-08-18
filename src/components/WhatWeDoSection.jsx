"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function WhatWeDoSection() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="what-we-do"
      className="py-24 md:py-36 px-5 md:px-16 bg-[#fdf8f8] border-t border-gray-200/60"
    >
      <div className="max-w-[1440px] mx-auto">
        <div ref={titleRef} className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-xs uppercase tracking-widest text-gray-600 bg-white mb-4">
            02 / WHAT WE DO
          </span>
          <h2 className="font-display-lg text-3xl sm:text-4xl md:text-5xl font-bold text-[#131313] tracking-tight mb-8">
            What We Do.
          </h2>
          <p className="font-body-lg text-base sm:text-lg text-gray-600 leading-relaxed">
            We empower students to learn and build with AWS and cloud technologies
            through hands-on workshops, real-world projects, hackathons, and
            collaborative learning. Our goal is to help students gain practical
            skills, explore new technologies, and grow together as a community.
          </p>
        </div>
      </div>
    </section>
  );
}
