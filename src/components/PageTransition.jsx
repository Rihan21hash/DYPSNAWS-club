"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function PageTransition({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="min-h-screen">
      {children}
    </div>
  );
}
