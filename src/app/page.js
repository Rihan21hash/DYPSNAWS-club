"use client";

import SmoothScroller from "@/components/SmoothScroller";
import ScrollProgressIndicator from "@/components/ScrollProgressIndicator";
import Hero from "@/components/Hero";
import IntroductionSection from "@/components/IntroductionSection";
import WhatWeDoSection from "@/components/WhatWeDoSection";
import EventsSection from "@/components/EventsSection";
import TeamSection from "@/components/TeamSection";
import CertificationsSection from "@/components/CertificationsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <SmoothScroller>
      <ScrollProgressIndicator />

      <main className="relative bg-white text-[#131313] overflow-hidden">
        {/* 1. Hero */}
        <Hero />

        {/* 2. Introduction */}
        <IntroductionSection />

        {/* 3. What We Do */}
        <WhatWeDoSection />

        {/* 4. Events */}
        <EventsSection />

        {/* 5. Core Team */}
        <TeamSection />

        {/* 6. Certifications */}
        <CertificationsSection />

        {/* 7. Footer */}
        <Footer />
      </main>
    </SmoothScroller>
  );
}
