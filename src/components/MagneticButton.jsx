"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";

export default function MagneticButton({ children, href = "#", className = "" }) {
  const buttonRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const btn = buttonRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <a
      ref={buttonRef}
      href={href}
      className={`group relative inline-flex items-center justify-center px-8 py-4 text-xs tracking-[0.18em] font-bold text-white rounded-full overflow-hidden transition-shadow duration-500 bg-[#AE5CFF] ${
        isHovered
          ? "shadow-[0_0_35px_rgba(174,92,255,0.5)]"
          : "shadow-[0_0_20px_rgba(174,92,255,0.25)]"
      } ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {/* Content */}
      <span className="relative z-10">{children}</span>

      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </a>
  );
}
