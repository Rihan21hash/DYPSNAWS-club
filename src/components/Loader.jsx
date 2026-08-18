"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const textRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    // Animate progress counter
    gsap.to(
      { val: 0 },
      {
        val: 100,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: function () {
          setProgress(Math.round(this.targets()[0].val));
        },
      }
    );

    // Fade out loader after delay
    tl.to(loaderRef.current, {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: "power3.inOut",
      delay: 2.4,
    }).set(loaderRef.current, { display: "none" });

    return () => tl.kill();
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#020B18]"
      style={{
        background:
          "radial-gradient(ellipse at center, #0A2540 0%, #020B18 100%)",
      }}
    >
      {/* Spinning circular text */}
      <div className="relative w-48 h-48 md:w-64 md:h-64">
        <svg
          ref={textRef}
          viewBox="0 0 200 200"
          className="w-full h-full animate-[spin_6s_linear_infinite]"
        >
          <defs>
            <path
              id="circlePath"
              d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
            />
          </defs>
          <text
            fill="#FF9900"
            fontSize="11"
            fontWeight="700"
            letterSpacing="3.5"
          >
            <textPath href="#circlePath">
              AWS STUDENT BUILDERS ✦ INITIALIZING ✦ CLOUD ECOSYSTEM ✦
            </textPath>
          </text>
        </svg>

        {/* Center percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl md:text-5xl font-black text-white">
            {progress}
          </span>
          <span className="text-[10px] text-[#FF9900] tracking-[0.3em] font-semibold mt-1">
            PERCENT
          </span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 text-xs text-white/30 tracking-[0.2em] font-mono">
        AWS
      </div>
      <div className="absolute bottom-8 right-8 text-xs text-[#FF9900]/50 tracking-[0.2em] font-mono">
        STUDENT BUILDER GROUP
      </div>
    </div>
  );
}
