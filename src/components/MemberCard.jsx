"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MemberCard({ member, index }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: index * 0.06,
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 90%",
        },
      });
    });

    return () => ctx.revert();
  }, [index]);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setTransform(
      `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`
    );
  };

  const handleMouseLeave = () => {
    setTransform("perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={cardRef}
      className="group glass-panel rounded-xl p-6 md:p-8 bg-white/90 border border-gray-200 shadow-sm hover:shadow-md hover:border-black/30 transition-all duration-300 flex flex-col justify-between"
      style={{
        transform,
        transition: transform === "" ? "none" : "transform 0.15s ease-out",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          {/* Avatar initial or icon */}
          <div className="w-14 h-14 rounded-lg bg-[#f1edec] border border-gray-200 flex items-center justify-center text-lg font-bold text-[#131313] group-hover:bg-black group-hover:text-white transition-colors duration-300">
            {member.avatar || member.name?.charAt(0) || "☁️"}
          </div>

          {/* Role badge */}
          <span className="font-mono-label text-xs uppercase px-3 py-1 bg-[#f7f3f2] border border-gray-200 rounded-full text-gray-700">
            {member.role}
          </span>
        </div>

        {/* Info */}
        <h3 className="font-headline-lg-mobile text-xl font-bold text-[#131313] mb-2 group-hover:pl-1 transition-all duration-200">
          {member.name}
        </h3>
        <p className="font-body-md text-sm text-gray-600 leading-relaxed">
          {member.tagline || member.bio || "AWS Student Builder"}
        </p>
      </div>

      {/* Index indicator */}
      <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-mono-label text-gray-400">
        <span>MEMBER // 0{index + 1}</span>
        <span className="text-gray-900 group-hover:translate-x-1 transition-transform">→</span>
      </div>
    </div>
  );
}
