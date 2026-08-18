"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-24 md:py-32 bg-[#050505] text-white border-t border-[#262626] relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display-lg text-6xl md:text-9xl opacity-[0.04] text-white pointer-events-none select-none whitespace-nowrap">
        AWS SBG
      </div>

      <div className="relative z-10 grid grid-cols-12 gap-8 px-5 md:px-16 max-w-[1440px] mx-auto items-end">
        {/* Brand & Copyright */}
        <div className="col-span-12 md:col-span-6 mb-8 md:mb-0">
          <div className="font-display-lg text-xl md:text-2xl font-black text-white uppercase mb-4 tracking-tight">
            AWS STUDENT BUILDER GROUP
          </div>
          <p className="font-mono-label text-xs uppercase tracking-widest text-[#A0A0A0] mt-6">
            © {new Date().getFullYear()} AWS STUDENT BUILDER GROUP - D Y Patil Salokhenagar, Kolhapur.
          </p>
        </div>

        {/* Links */}
        <div className="col-span-12 md:col-span-6 flex flex-col md:items-end justify-end">
          <div className="flex flex-wrap gap-6 md:gap-8 font-mono-label text-xs">
            <Link
              href="/events"
              className="uppercase tracking-widest text-[#A0A0A0] hover:text-white hover:underline underline-offset-4 transition-all"
            >
              Events
            </Link>
            <Link
              href="/team"
              className="uppercase tracking-widest text-[#A0A0A0] hover:text-white hover:underline underline-offset-4 transition-all"
            >
              Team
            </Link>
            <Link
              href="/quiz"
              className="uppercase tracking-widest text-[#A0A0A0] hover:text-white hover:underline underline-offset-4 transition-all"
            >
              Quiz
            </Link>
            <Link
              href="/certifications"
              className="uppercase tracking-widest text-[#A0A0A0] hover:text-white hover:underline underline-offset-4 transition-all"
            >
              Certificates
            </Link>
            <a
              href="https://aws.amazon.com/free"
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase tracking-widest text-[#A0A0A0] hover:text-white hover:underline underline-offset-4 transition-all"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
