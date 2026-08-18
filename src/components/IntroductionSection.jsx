"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function IntroductionSection() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="intro"
      className="py-24 md:py-36 relative w-full max-w-[1440px] mx-auto px-5 md:px-16 bg-white text-[#131313]"
    >
      <div className="grid grid-cols-12 gap-8">
        <div
          ref={contentRef}
          className="col-span-12 md:col-span-8 md:col-start-3"
        >
          <h2 className="font-display-lg text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#131313] text-center leading-[1.08] tracking-tight">
            We don&apos;t just learn cloud.
            <br />
            <span className="text-[#131313]">We build with it.</span>
          </h2>

          <div className="mt-14 md:mt-16 w-full h-[1px] bg-gray-200" />

          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="font-mono-label text-xs uppercase tracking-widest text-gray-500 font-medium">
              SYS.ARCHITECTURE / 01
            </div>
            <div className="font-body-md text-sm md:text-base text-gray-600 max-w-md sm:text-right leading-relaxed">
              Our collective focuses on real-world implementations, turning theoretical
              knowledge into robust, scalable, and secure cloud infrastructure.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
