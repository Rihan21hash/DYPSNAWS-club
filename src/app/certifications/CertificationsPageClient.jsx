"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SmoothScroller from "@/components/SmoothScroller";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import useRealtimeTable from "@/hooks/useRealtimeTable";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_CERTS = [
  {
    id: "clf-c02",
    name: "AWS Certified Cloud Practitioner",
    code: "CLF-C02",
    level: "Foundational",
    tier: "Foundational",
    description:
      "Validates foundational, high-level understanding of AWS Cloud services, security, architecture, pricing, and support.",
    duration: "90 mins",
    questions: "65 questions",
    passingScore: "700 / 1000",
    topics: ["Cloud Concepts", "Security & Compliance", "Cloud Technology & Services", "Billing, Pricing & Support"],
  },
  {
    id: "aif-c01",
    name: "AWS Certified AI Practitioner",
    code: "AIF-C01",
    level: "Foundational",
    tier: "Foundational",
    description:
      "Validates fundamental knowledge of artificial intelligence (AI), machine learning (ML), and generative AI concepts and use cases on AWS.",
    duration: "90 mins",
    questions: "65 questions",
    passingScore: "700 / 1000",
    topics: ["Fundamentals of AI/ML", "Fundamentals of Generative AI", "Applications of Foundation Models", "Guidelines for Responsible AI", "Security & Compliance for AI"],
  },
  {
    id: "saa-c03",
    name: "AWS Certified Solutions Architect – Associate",
    code: "SAA-C03",
    level: "Associate",
    tier: "Associate",
    description:
      "Demonstrates expertise in designing secure, resilient, high-performing, and cost-optimized distributed systems on AWS.",
    duration: "130 mins",
    questions: "65 questions",
    passingScore: "720 / 1000",
    topics: ["Design Resilient Architectures", "Design High-Performing Architectures", "Design Secure Applications", "Design Cost-Optimized Architectures"],
  },
  {
    id: "dva-c02",
    name: "AWS Certified Developer – Associate",
    code: "DVA-C02",
    level: "Associate",
    tier: "Associate",
    description:
      "Validates proficiency in developing, deploying, and debugging cloud-based applications using AWS core services.",
    duration: "130 mins",
    questions: "65 questions",
    passingScore: "720 / 1000",
    topics: ["Development with AWS Services", "Security & Authentication", "Deployment & CI/CD", "Refactoring & Serverless", "Monitoring & Troubleshooting"],
  },
  {
    id: "soa-c02",
    name: "AWS Certified SysOps Administrator – Associate",
    code: "SOA-C02",
    level: "Associate",
    tier: "Associate",
    description:
      "Demonstrates experience in deploying, managing, and operating workloads on AWS, including security controls and compliance requirements.",
    duration: "130 mins",
    questions: "65 questions",
    passingScore: "720 / 1000",
    topics: ["Monitoring, Logging, and Remediation", "Reliability and Business Continuity", "Deployment, Provisioning, and Automation", "Security and Compliance", "Networking and Content Delivery", "Cost and Performance Optimization"],
  },
  {
    id: "dea-c01",
    name: "AWS Certified Data Engineer – Associate",
    code: "DEA-C01",
    level: "Associate",
    tier: "Associate",
    description:
      "Validates skills in implementing data pipelines, monitoring data architecture, and optimizing data processing workflows on AWS.",
    duration: "130 mins",
    questions: "65 questions",
    passingScore: "720 / 1000",
    topics: ["Data Ingestion and Transformation", "Data Store Management", "Data Operations and Support", "Data Security and Governance"],
  },
  {
    id: "sap-c02",
    name: "AWS Certified Solutions Architect – Professional",
    code: "SAP-C02",
    level: "Professional",
    tier: "Professional",
    description:
      "Demonstrates advanced technical skills and experience in designing distributed applications and systems on the AWS platform.",
    duration: "180 mins",
    questions: "75 questions",
    passingScore: "750 / 1000",
    topics: ["Design for Organizational Complexity", "Design for New Solutions", "Continuous Improvement for Existing Solutions", "Accelerate Workload Migration and Modernization"],
  },
  {
    id: "dop-c02",
    name: "AWS Certified DevOps Engineer – Professional",
    code: "DOP-C02",
    level: "Professional",
    tier: "Professional",
    description:
      "Validates technical expertise in provisioning, operating, and managing distributed application systems on the AWS platform.",
    duration: "180 mins",
    questions: "75 questions",
    passingScore: "750 / 1000",
    topics: ["SDLC Automation", "Configuration Management and IaC", "Resilient Cloud Solutions", "Monitoring and Logging", "Incident and Event Response", "Security and Compliance"],
  },
  {
    id: "scs-c02",
    "name": "AWS Certified Security – Specialty",
    code: "SCS-C02",
    level: "Specialty",
    tier: "Specialty",
    description:
      "Validates comprehensive expertise in securing data, infrastructure, identities, and workloads in the AWS Cloud.",
    duration: "170 mins",
    questions: "65 questions",
    passingScore: "750 / 1000",
    topics: ["Threat Detection and Incident Response", "Security Logging and Monitoring", "Infrastructure Security", "Identity and Access Management", "Data Protection", "Management and Security Governance"],
  }
];

const TIERS = [
  { id: "ALL", label: "All Pathways" },
  { id: "Foundational", label: "Foundational" },
  { id: "Associate", label: "Associate" },
  { id: "Professional", label: "Professional" },
  { id: "Specialty", label: "Specialty" },
];

/* ── Detail Modal ── */
function CertDetailModal({ cert, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const tier = cert.tier || cert.level || "Foundational";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 max-w-lg w-full glass-panel bg-white p-6 sm:p-8 rounded-xl text-left shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-all cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 bg-[#E7F4E8] text-[#1b873f] px-2.5 py-0.5 rounded-sm border border-[#CDE5CE] font-mono-label text-[10px] uppercase font-bold">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            {tier}
          </span>
          <span className="font-mono-label text-xs text-gray-400">
            {cert.code}
          </span>
        </div>

        <h3 className="font-display-lg text-2xl font-bold text-[#131313] mb-3 leading-snug">
          {cert.name}
        </h3>

        <p className="font-body-md text-sm text-gray-600 leading-relaxed mb-6">
          {cert.description}
        </p>

        {/* Quick Specs */}
        <div className="grid grid-cols-3 gap-2 p-3.5 bg-[#f7f3f2] rounded-lg border border-gray-200 mb-6 font-mono-label text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase">Duration</span>
            <span className="font-bold text-[#131313]">{cert.duration || "90 mins"}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase">Format</span>
            <span className="font-bold text-[#131313]">{cert.questions || "65 Qs"}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px] uppercase">Pass Score</span>
            <span className="font-bold text-[#131313]">{cert.passingScore || "700+"}</span>
          </div>
        </div>

        {/* Exam Topics */}
        {cert.topics && cert.topics.length > 0 && (
          <div className="mb-6">
            <h4 className="font-mono-label text-xs font-bold text-gray-600 uppercase tracking-wider mb-2.5">
              Key Exam Domains
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {cert.topics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-[#f1edec] rounded text-xs text-gray-700 font-body-md"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Certificate Card ── */
function CertCard({ cert, index }) {
  const cardRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  const tier = cert.tier || cert.level || "Foundational";

  const getIcon = (name) => {
    const n = (name || "").toLowerCase();
    if (n.includes("architect")) return "architecture";
    if (n.includes("developer") || n.includes("devops")) return "terminal";
    if (n.includes("ai") || n.includes("machine learning")) return "smart_toy";
    if (n.includes("security")) return "security";
    if (n.includes("network")) return "hub";
    if (n.includes("data") || n.includes("database")) return "database";
    if (n.includes("sysops")) return "settings_suggest";
    return "cloud";
  };

  const getTierColor = (t) => {
    switch (t) {
      case "Foundational":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Associate":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Professional":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Specialty":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <>
      {showModal && <CertDetailModal cert={cert} onClose={() => setShowModal(false)} />}

      <article
        ref={cardRef}
        onClick={() => setShowModal(true)}
        className="glass-panel rounded-xl p-6 sm:p-7 flex flex-col h-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-black/30 transition-all duration-300 cursor-pointer group"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="w-11 h-11 bg-[#f1edec] rounded-lg flex items-center justify-center text-[#0073BB] group-hover:bg-[#131313] group-hover:text-white transition-colors duration-300">
            <span className="material-symbols-outlined text-[22px]">
              {getIcon(cert.name)}
            </span>
          </div>

          <span
            className={`font-mono-label text-[10px] uppercase font-bold px-2.5 py-1 rounded border ${getTierColor(
              tier
            )}`}
          >
            {tier}
          </span>
        </div>

        {/* Title & Desc */}
        <h3 className="font-body-lg text-base sm:text-lg font-bold text-[#131313] mb-2 group-hover:text-black leading-snug">
          {cert.name}
        </h3>
        <p className="font-body-md text-xs sm:text-sm text-gray-600 mb-6 flex-grow leading-relaxed line-clamp-3">
          {cert.description}
        </p>

        {/* Metadata Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between font-mono-label text-xs text-gray-500">
          <span>{cert.code || "AWS"}</span>
          <span className="text-[#131313] font-bold group-hover:translate-x-0.5 transition-transform">
            View Details →
          </span>
        </div>
      </article>
    </>
  );
}

export default function CertificationsPageClient() {
  const titleRef = useRef(null);
  const [selectedTier, setSelectedTier] = useState("ALL");
  const { data: liveCerts, loading } = useRealtimeTable("certifications", "/api/certifications");

  const allCerts =
    liveCerts && liveCerts.length > 0
      ? liveCerts.map((c) => ({ ...c, tier: c.tier || c.level || "Foundational" }))
      : loading
      ? []
      : DEFAULT_CERTS;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }, titleRef);

    return () => ctx.revert();
  }, []);

  const filteredCerts =
    selectedTier === "ALL"
      ? allCerts
      : allCerts.filter((c) => (c.tier || c.level) === selectedTier);

  return (
    <SmoothScroller>
      <PageTransition>
        <div className="bg-[#fdf8f8] min-h-screen flex flex-col pt-20 text-[#1c1b1b]">
          {/* Main Content */}
          <main className="flex-grow px-5 md:px-16 max-w-[1440px] mx-auto w-full py-16 md:py-24">
            {/* Header Section */}
            <header ref={titleRef} className="mb-14 md:mb-16 grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-8 md:col-start-3 text-center">
                <div className="inline-flex items-center justify-center border border-gray-300 rounded-sm px-3.5 py-1 mb-6 bg-white shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                  <span className="font-mono-label text-xs text-gray-700 uppercase tracking-widest font-semibold">
                    Credential Registry
                  </span>
                </div>

                <h1 className="font-display-xl text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#131313] mb-6 tracking-tight">
                  AWS Certification Pathways.
                </h1>

                <p className="font-body-lg text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Official AWS certification pathways structured into Foundational, Associate,
                  Professional, and Specialty tiers to guide student builders from fundamentals to advanced mastery.
                </p>
              </div>

              <div className="col-span-12 md:col-span-8 md:col-start-3 mt-4">
                <div className="h-px w-full bg-gray-200" />
              </div>
            </header>

            {/* Tier Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {TIERS.map((tier) => {
                const count =
                  tier.id === "ALL"
                    ? allCerts.length
                    : allCerts.filter((c) => (c.tier || c.level) === tier.id).length;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`font-mono-label text-xs px-4 py-2 rounded-full border transition-all cursor-pointer flex items-center gap-2 ${
                      selectedTier === tier.id
                        ? "bg-[#131313] text-white border-[#131313] font-bold shadow-sm"
                        : "bg-white text-gray-600 border-gray-300 hover:border-black/50"
                    }`}
                  >
                    <span>{tier.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedTier === tier.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Loading state */}
            {loading && allCerts.length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-gray-100/70 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {/* If viewing ALL, show organized by tier sections */}
            {selectedTier === "ALL" ? (
              <div className="space-y-16 pb-16">
                {["Foundational", "Associate", "Professional", "Specialty"].map((tierName) => {
                  const tierCerts = allCerts.filter((c) => (c.tier || c.level) === tierName);
                  if (tierCerts.length === 0) return null;
                  return (
                    <section key={tierName}>
                      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
                        <h2 className="font-display-lg text-2xl font-bold text-[#131313]">
                          {tierName} Level
                        </h2>
                        <span className="font-mono-label text-xs text-gray-400">
                          ({tierCerts.length} {tierCerts.length === 1 ? "Path" : "Paths"})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tierCerts.map((cert, index) => (
                          <CertCard
                            key={cert.id || cert.code || index}
                            cert={cert}
                            index={index}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              /* Specific Tier View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
                {filteredCerts.map((cert, index) => (
                  <CertCard
                    key={cert.id || cert.code || index}
                    cert={cert}
                    index={index}
                  />
                ))}
              </div>
            )}
          </main>

          <Footer />
        </div>
      </PageTransition>
    </SmoothScroller>
  );
}
