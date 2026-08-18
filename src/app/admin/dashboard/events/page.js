"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

export default function EventsListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (slug) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setDeleting(slug);
    const res = await fetch(`/api/events/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.slug !== slug));
    }
    setDeleting(null);
  };

  return (
    <AdminLayout
      badge="02 / EVENTS"
      title="Events & Workshops."
      subtitle="Manage and publish community events"
    >
      {/* Header bar */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-mono-label text-xs text-gray-500 font-semibold">
          {events.length} {events.length === 1 ? "Event" : "Events"} Total
        </span>
        <Link
          href="/admin/dashboard/events/new"
          className="px-5 py-2.5 rounded-full bg-[#131313] hover:bg-black text-white text-xs font-mono-label font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Event
        </Link>
      </div>

      {/* Events Table Container */}
      <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-4 bg-[#f7f3f2] border-b border-gray-200 font-mono-label text-[11px] uppercase tracking-wider text-gray-600 font-bold">
          <span className="col-span-4">Event</span>
          <span className="col-span-2">Date</span>
          <span className="col-span-2">Type</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        {loading && (
          <div className="py-12 text-center text-gray-400 font-mono-label text-xs">
            Loading events…
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-mono-label text-xs">
            No events found. Click &quot;Add Event&quot; to create one.
          </div>
        )}

        {events.map((e) => (
          <div
            key={e.slug}
            className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 last:border-none items-center hover:bg-[#f7f3f2]/50 transition-colors"
          >
            {/* Title & Desc */}
            <div className="col-span-4 pr-4">
              <div className="font-body-lg text-sm font-bold text-[#131313] truncate">
                {e.title}
              </div>
              <div className="font-mono-label text-xs text-gray-400 truncate mt-0.5">
                /{e.slug}
              </div>
            </div>

            {/* Date */}
            <div className="col-span-2 font-mono-label text-xs text-gray-600">
              {e.date}
            </div>

            {/* Type */}
            <div className="col-span-2">
              <span
                className="px-2.5 py-1 rounded-full font-mono-label text-[10px] uppercase font-bold"
                style={{
                  color: e.color || "#131313",
                  background: `${e.color || "#131313"}12`,
                  border: `1px solid ${e.color || "#131313"}30`,
                }}
              >
                {e.type}
              </span>
            </div>

            {/* Status */}
            <div className="col-span-2 font-mono-label text-xs">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  e.status?.toLowerCase() === "happened"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    e.status?.toLowerCase() === "happened" ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                />
                {e.status || "Upcoming"}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-2">
              <button
                onClick={() => router.push(`/admin/dashboard/events/${e.slug}`)}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:border-black text-[#131313] font-mono-label text-xs font-bold transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(e.slug)}
                disabled={deleting === e.slug}
                className="px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 font-mono-label text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting === e.slug ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
