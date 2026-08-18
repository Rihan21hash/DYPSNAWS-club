"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

export default function CertificationsListPage() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/certifications")
      .then((r) => r.json())
      .then((data) => setCerts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this certification?")) return;
    setDeleting(id);
    const res = await fetch(`/api/certifications/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCerts((prev) => prev.filter((c) => c.id !== id));
    }
    setDeleting(null);
  };

  return (
    <AdminLayout
      badge="04 / CERTIFICATIONS"
      title="AWS Certifications."
      subtitle="Manage official certification pathways and details"
    >
      {/* Header bar */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-mono-label text-xs text-gray-500 font-semibold">
          {certs.length} {certs.length === 1 ? "Path" : "Pathways"} Registered
        </span>
        <Link
          href="/admin/dashboard/certifications/new"
          className="px-5 py-2.5 rounded-full bg-[#131313] hover:bg-black text-white text-xs font-mono-label font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Certification
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-12 px-6 py-4 bg-[#f7f3f2] border-b border-gray-200 font-mono-label text-[11px] uppercase tracking-wider text-gray-600 font-bold">
          <span className="col-span-5">Certification Name</span>
          <span className="col-span-2">Code</span>
          <span className="col-span-2">Level</span>
          <span className="col-span-1">Duration</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        {loading && (
          <div className="py-12 text-center text-gray-400 font-mono-label text-xs">
            Loading certification pathways…
          </div>
        )}

        {!loading && certs.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-mono-label text-xs">
            No certifications found. Click &quot;Add Certification&quot; to create one.
          </div>
        )}

        {certs.map((c) => (
          <div
            key={c.id || c.code}
            className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 last:border-none items-center hover:bg-[#f7f3f2]/50 transition-colors"
          >
            {/* Name */}
            <div className="col-span-5 pr-4">
              <div className="font-body-lg text-sm font-bold text-[#131313]">
                {c.name}
              </div>
              <div className="font-mono-label text-xs text-gray-400 truncate mt-0.5">
                {c.description}
              </div>
            </div>

            {/* Code */}
            <div className="col-span-2 font-mono-label text-xs font-bold text-gray-700">
              {c.code}
            </div>

            {/* Level */}
            <div className="col-span-2">
              <span className="px-2.5 py-1 bg-[#f7f3f2] border border-gray-200 rounded-full font-mono-label text-[10px] uppercase font-bold text-gray-700">
                {c.level || c.tier || "Foundational"}
              </span>
            </div>

            {/* Duration */}
            <div className="col-span-1 font-mono-label text-xs text-gray-500">
              {c.duration || "90 mins"}
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-2">
              <button
                onClick={() => router.push(`/admin/dashboard/certifications/${c.id}`)}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:border-black text-[#131313] font-mono-label text-xs font-bold transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deleting === c.id}
                className="px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 font-mono-label text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting === c.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
