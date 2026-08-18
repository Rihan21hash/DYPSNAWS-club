"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STITCH_HERO_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBUj6Lmek8JE4EEqposninu07zMOO_va82vAVMrj_uEzi2l7aiaLrbuo-wA6wbjUdRhQ50kVeYkqWB2GzGqgIKPQ77G4uN2Q9E9lX2-kXVINPK_P_zS6QPbXBdyB6TpgbOkPjxvP3akbiBX1Fel_dg4U6-YFzGYIAmRklet5W32PHfrj2JOERQE-bGGfQfkNqK7TWfFzjsr-ztBIpqJe2xuSIDE6_KZmwLvDWugSQGlxGjXLRBRJZzb";

export default function Hero() {
  const sectionRef = useRef(null);
  const textGroupRef = useRef(null);
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation on mount
      gsap.from(textGroupRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      if (cardsRef.current) {
        gsap.from(cardsRef.current.children, {
          x: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.2,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('${STITCH_HERO_BG}')`,
      }}
    >
      {/* Overlay gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-5 md:px-16 grid grid-cols-12 gap-8 h-full py-16">
        {/* Left Headline & Content */}
        <div
          ref={textGroupRef}
          className="col-span-12 md:col-span-6 flex flex-col justify-center h-full"
        >
          <h1 className="font-display-lg text-5xl sm:text-6xl md:text-7xl text-white mb-6 font-bold tracking-tight drop-shadow-md leading-[1.05]">
            Build.
            <br />
            Learn.
            <br />
            Deploy.
          </h1>

          <div className="flex flex-col gap-8 mt-2 w-full">
            <p className="font-body-lg text-base sm:text-lg text-white/90 max-w-md drop-shadow-md font-medium leading-relaxed">
              A high-performance technical collective dedicated to mastering cloud
              architecture and engineering excellence at AWS scale.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://builder.aws.com/community/student-builder-groups"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#131313] text-white font-body-md text-sm md:text-base font-medium py-3 px-6 rounded-md hover:bg-black transition-colors duration-300 shadow-lg flex items-center border border-white/10"
              >
                Builder Center
              </a>
              <Link
                href="/events"
                className="bg-white text-[#131313] font-body-md text-sm md:text-base font-medium py-3 px-6 rounded-md hover:bg-gray-50 transition-colors duration-300 shadow-lg"
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>

        {/* Right Floating Task Cards */}
        <div
          ref={cardsRef}
          className="hidden md:flex col-span-6 flex-col justify-center items-end h-full gap-5 relative pr-4"
        >
          {/* Task 1 */}
          <div className="glass-panel rounded-md p-3.5 flex items-center gap-3 w-72 shadow-lg transform translate-x-10 -translate-y-8 hover:translate-x-8 transition-transform duration-300">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-mono-label uppercase">
                Task Completed
              </span>
              <span className="text-sm text-gray-900 font-medium font-body-md">
                Cloud Architecture
              </span>
            </div>
          </div>

          {/* Task 2 */}
          <div className="glass-panel rounded-md p-3.5 flex items-center gap-3 w-72 shadow-lg transform -translate-x-6 hover:-translate-x-4 transition-transform duration-300">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-mono-label uppercase">
                Task running
              </span>
              <span className="text-sm text-gray-900 font-medium font-body-md">
                Deploying EC2 instances
              </span>
            </div>
          </div>

          {/* Task 3 */}
          <div className="glass-panel rounded-md p-3.5 flex items-center gap-3 w-72 shadow-lg transform translate-x-4 translate-y-6 hover:translate-x-2 transition-transform duration-300">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-mono-label uppercase">
                Task Completed
              </span>
              <span className="text-sm text-gray-900 font-medium font-body-md">
                Database Migration
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
