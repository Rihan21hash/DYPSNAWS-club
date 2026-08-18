"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

const TABS = [
  { key: "core", label: "Core Team" },
  { key: "contributors", label: "Contributors" },
];

export default function TeamListPage() {
  const [members, setMembers] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState("core");
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      fetch("/api/team").then((r) => r.json()),
      fetch("/api/team?type=contributor").then((r) => r.json()),
    ])
      .then(([membersData, contribData]) => {
        setMembers(Array.isArray(membersData) ? membersData : []);
        setContributors(Array.isArray(contribData) ? contribData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteMember = async (id) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    setDeleting(id);
    const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
    if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== id));
    setDeleting(null);
  };

  const handleDeleteContributor = async (id) => {
    if (!confirm("Are you sure you want to delete this contributor?")) return;
    setDeleting(id);
    const res = await fetch(`/api/team/${id}?type=contributor`, { method: "DELETE" });
    if (res.ok) setContributors((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  };

  const currentList = activeTab === "core" ? members : contributors;

  return (
    <AdminLayout
      badge="03 / TEAM"
      title="Team & Contributors."
      subtitle="Manage club leadership, technical team, and contributors"
    >
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-[#f1edec] rounded-full w-fit border border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-full font-mono-label text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-[#131313] text-white shadow-sm"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {tab.label} ({tab.key === "core" ? members.length : contributors.length})
          </button>
        ))}
      </div>

      {/* Actions bar */}
      <div className="flex justify-between items-center mb-6">
        <span className="font-mono-label text-xs text-gray-500 font-semibold">
          {currentList.length} {activeTab === "core" ? "Core Members" : "Contributors"}
        </span>
        <Link
          href={activeTab === "core" ? "/admin/dashboard/team/new" : "/admin/dashboard/team/new?type=contributor"}
          className="px-5 py-2.5 rounded-full bg-[#131313] hover:bg-black text-white text-xs font-mono-label font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {activeTab === "core" ? "Add Member" : "Add Contributor"}
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-12 px-6 py-4 bg-[#f7f3f2] border-b border-gray-200 font-mono-label text-[11px] uppercase tracking-wider text-gray-600 font-bold">
          <span className="col-span-1">Avatar</span>
          <span className="col-span-4">Name</span>
          <span className="col-span-3">Role</span>
          {activeTab === "core" && <span className="col-span-2">Certs</span>}
          <span className={`${activeTab === "core" ? "col-span-2" : "col-span-4"} text-right`}>Actions</span>
        </div>

        {loading && (
          <div className="py-12 text-center text-gray-400 font-mono-label text-xs">
            Loading team roster…
          </div>
        )}

        {!loading && currentList.length === 0 && (
          <div className="py-12 text-center text-gray-400 font-mono-label text-xs">
            No {activeTab === "core" ? "members" : "contributors"} found. Click &quot;Add Member&quot; to add one.
          </div>
        )}

        {currentList.map((m) => (
          <div
            key={m.id || m.name}
            className="grid grid-cols-12 px-6 py-4 border-b border-gray-100 last:border-none items-center hover:bg-[#f7f3f2]/50 transition-colors"
          >
            {/* Avatar */}
            <div className="col-span-1">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-mono-label text-xs font-bold text-white"
                style={{
                  background: m.color || "#131313",
                }}
              >
                {m.avatar || m.name?.slice(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Name & Tagline */}
            <div className="col-span-4 pr-4">
              <div className="font-body-lg text-sm font-bold text-[#131313]">
                {m.name}
              </div>
              {m.tagline && (
                <div className="font-mono-label text-xs text-gray-400 truncate mt-0.5">
                  {m.tagline}
                </div>
              )}
            </div>

            {/* Role */}
            <div className="col-span-3">
              <span className="px-3 py-1 bg-[#f7f3f2] border border-gray-200 rounded-full font-mono-label text-xs font-semibold text-gray-700">
                {m.role}
              </span>
            </div>

            {/* Certifications Count (if core) */}
            {activeTab === "core" && (
              <div className="col-span-2 font-mono-label text-xs text-gray-500">
                {m.certifications?.length || 0} Certs
              </div>
            )}

            {/* Actions */}
            <div className={`${activeTab === "core" ? "col-span-2" : "col-span-4"} flex items-center justify-end gap-2`}>
              <button
                onClick={() => router.push(activeTab === "core" ? `/admin/dashboard/team/${m.id}` : `/admin/dashboard/team/${m.id}?type=contributor`)}
                className="px-3 py-1 rounded-lg border border-gray-300 hover:border-black text-[#131313] font-mono-label text-xs font-bold transition-colors cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => activeTab === "core" ? handleDeleteMember(m.id) : handleDeleteContributor(m.id)}
                disabled={deleting === m.id}
                className="px-3 py-1 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 font-mono-label text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting === m.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
