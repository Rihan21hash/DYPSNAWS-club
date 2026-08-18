"use client";

import AdminGuard from "./AdminGuard";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children, title, subtitle, badge = "ADMIN" }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-[#fdf8f8] text-[#1c1b1b]">
        <AdminSidebar />
        <main className="flex-1 md:ml-[260px] p-6 sm:p-10 min-h-screen">
          {/* Page header */}
          {title && (
            <div className="mb-8">
              {badge && (
                <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-[11px] uppercase tracking-widest text-gray-600 bg-[#f1edec] mb-3">
                  {badge}
                </span>
              )}
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#131313] tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="font-body-md text-sm text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
