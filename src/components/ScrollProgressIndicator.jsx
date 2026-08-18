"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "intro", label: "SYS.ARCHITECTURE" },
  { id: "what-we-do", label: "What We Do" },
  { id: "events", label: "Events" },
  { id: "team", label: "Core Team" },
  { id: "certifications", label: "Certifications" },
];

export default function ScrollProgressIndicator() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const section = document.getElementById(SECTIONS[i].id);
        if (section) {
          const top = section.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[9990] hidden lg:flex flex-col items-center gap-3">
      {SECTIONS.map((sec) => {
        const isActive = activeSection === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className="group relative flex items-center justify-end p-1.5 focus:outline-none"
            aria-label={`Scroll to ${sec.label}`}
          >
            {/* Label tooltip on hover */}
            <span className="absolute right-7 px-2.5 py-1 rounded bg-black/90 font-mono-label text-[10px] uppercase text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-md">
              {sec.label}
            </span>

            {/* Dot */}
            <span
              className={`block rounded-full transition-all duration-300 ${
                isActive
                  ? "w-2.5 h-2.5 bg-black scale-110 shadow-sm"
                  : "w-1.5 h-1.5 bg-black/20 hover:bg-black/60 group-hover:scale-125"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
