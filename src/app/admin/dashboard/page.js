"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

function StatCard({ label, value, icon, color, href }) {
  return (
    <Link
      href={href}
      className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-[0_4px_25px_rgba(0,0,0,0.02)] hover:shadow-md hover:border-black/30 transition-all duration-300 flex items-center gap-5 group"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{
          background: `${color}15`,
          color: color,
          border: `1px solid ${color}30`,
        }}
      >
        {icon}
      </div>
      <div>
        <div className="font-display-lg text-3xl font-extrabold text-[#131313] leading-tight">
          {value}
        </div>
        <div className="font-mono-label text-xs text-gray-500 uppercase tracking-wider mt-0.5">
          {label}
        </div>
      </div>
    </Link>
  );
}

function RecentItem({ title, subtitle, type, color }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-none">
      <div>
        <div className="font-body-lg text-sm font-bold text-[#131313]">{title}</div>
        <div className="font-mono-label text-xs text-gray-500 mt-0.5">{subtitle}</div>
      </div>
      <span
        className="px-3 py-1 rounded-full font-mono-label text-[10px] uppercase font-bold tracking-wider"
        style={{
          color: color || "#131313",
          background: `${color || "#131313"}12`,
          border: `1px solid ${color || "#131313"}30`,
        }}
      >
        {type}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ events: 0, members: 0, contributors: 0, certifications: 0, quizzes: 0 });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/events").then((r) => r.json()),
      fetch("/api/team").then((r) => r.json()),
      fetch("/api/team?type=contributor").then((r) => r.json()),
      fetch("/api/certifications").then((r) => r.json()),
      fetch("/api/quizzes").then((r) => r.json()),
    ])
      .then(([evts, members, contribs, certs, quizzes]) => {
        setEvents(Array.isArray(evts) ? evts.slice(0, 5) : []);
        setStats({
          events: Array.isArray(evts) ? evts.length : 0,
          members: Array.isArray(members) ? members.length : 0,
          contributors: Array.isArray(contribs) ? contribs.length : 0,
          certifications: Array.isArray(certs) ? certs.length : 0,
          quizzes: Array.isArray(quizzes) ? quizzes.length : 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout
      badge="01 / OVERVIEW"
      title="Dashboard."
      subtitle="Overview of your AWS Student Builder Group portal"
    >
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total Events"
          value={stats.events}
          color="#8B5CF6"
          href="/admin/dashboard/events"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Team Members"
          value={stats.members + stats.contributors}
          color="#0073BB"
          href="/admin/dashboard/team"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Certifications"
          value={stats.certifications}
          color="#10B981"
          href="/admin/dashboard/certifications"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
          }
        />
        <StatCard
          label="Live Quizzes"
          value={stats.quizzes}
          color="#F59E0B"
          href="/admin/dashboard/quizzes"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
      </div>

      {/* Quick Action & Recent Events Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <div className="lg:col-span-2 bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h2 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313]">
              Recent Events
            </h2>
            <Link
              href="/admin/dashboard/events"
              className="font-mono-label text-xs font-bold text-gray-500 hover:text-black transition-colors"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-400 font-mono-label text-xs">
              Loading events…
            </div>
          ) : events.length === 0 ? (
            <div className="py-8 text-center text-gray-400 font-mono-label text-xs">
              No events found. Click below to create your first event.
            </div>
          ) : (
            <div className="flex flex-col">
              {events.map((event) => (
                <RecentItem
                  key={event.slug}
                  title={event.title}
                  subtitle={event.date}
                  type={event.type}
                  color={event.color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h2 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-4 pb-4 border-b border-gray-100">
              Quick Actions
            </h2>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/admin/dashboard/events/new"
                className="flex items-center justify-between p-3 rounded-xl bg-[#f7f3f2] hover:bg-[#131313] hover:text-white text-xs font-mono-label font-bold text-gray-800 transition-all duration-200 group"
              >
                <span>+ Create New Event</span>
                <span className="text-gray-400 group-hover:text-white">→</span>
              </Link>
              <Link
                href="/admin/dashboard/team/new"
                className="flex items-center justify-between p-3 rounded-xl bg-[#f7f3f2] hover:bg-[#131313] hover:text-white text-xs font-mono-label font-bold text-gray-800 transition-all duration-200 group"
              >
                <span>+ Add Team Member</span>
                <span className="text-gray-400 group-hover:text-white">→</span>
              </Link>
              <Link
                href="/admin/dashboard/certifications/new"
                className="flex items-center justify-between p-3 rounded-xl bg-[#f7f3f2] hover:bg-[#131313] hover:text-white text-xs font-mono-label font-bold text-gray-800 transition-all duration-200 group"
              >
                <span>+ Add Certification</span>
                <span className="text-gray-400 group-hover:text-white">→</span>
              </Link>
              <Link
                href="/admin/dashboard/quizzes/new"
                className="flex items-center justify-between p-3 rounded-xl bg-[#f7f3f2] hover:bg-[#131313] hover:text-white text-xs font-mono-label font-bold text-gray-800 transition-all duration-200 group"
              >
                <span>+ Create Quiz</span>
                <span className="text-gray-400 group-hover:text-white">→</span>
              </Link>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 font-mono-label text-xs font-bold text-[#131313] hover:underline underline-offset-4"
            >
              Preview Live Website ↗
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
