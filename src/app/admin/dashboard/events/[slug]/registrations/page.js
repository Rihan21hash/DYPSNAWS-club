"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

export default function EventRegistrationsPage() {
  const params = useParams();
  const [registrations, setRegistrations] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [regsRes, eventRes] = await Promise.all([
          fetch(`/api/registrations?eventSlug=${params.slug}`),
          fetch(`/api/events/${params.slug}`),
        ]);
        const regsData = await regsRes.json();
        const eventData = await eventRes.json();

        setRegistrations(Array.isArray(regsData) ? regsData : []);
        if (!eventData.error) setEvent(eventData);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.slug]);

  const exportToCSV = () => {
    if (!registrations.length) return;

    // Collect all form_data keys
    const formKeys = new Set();
    registrations.forEach((r) => {
      if (r.form_data && typeof r.form_data === "object") {
        Object.keys(r.form_data).forEach((k) => formKeys.add(k));
      }
    });

    const headers = ["#", "Name", "Email", ...Array.from(formKeys), "Registered At"];
    const rows = registrations.map((r, i) => {
      const formValues = Array.from(formKeys).map((k) => {
        const val = r.form_data?.[k] || "";
        // Escape quotes and commas in CSV
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      const date = new Date(r.registered_at).toLocaleString();
      return [
        i + 1,
        `"${(r.user_name || "").replace(/"/g, '""')}"`,
        `"${r.user_email}"`,
        ...formValues,
        `"${date}"`,
      ].join(",");
    });

    const csv = [headers.map((h) => `"${h}"`).join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${params.slug}-registrations.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout title="REGISTRATIONS" subtitle="Loading...">
        <div style={{ textAlign: "center", padding: "60px", color: "rgba(245,245,245,0.3)" }}>Loading...</div>
      </AdminLayout>
    );
  }

  // Get all form data keys for table headers
  const formKeys = new Set();
  registrations.forEach((r) => {
    if (r.form_data && typeof r.form_data === "object") {
      Object.keys(r.form_data).forEach((k) => formKeys.add(k));
    }
  });
  const formKeysList = Array.from(formKeys);

  return (
    <AdminLayout
      title="REGISTRATIONS"
      subtitle={event ? `${event.title} — ${registrations.length} registrations` : `${registrations.length} registrations`}
    >
      <div style={{ marginBottom: "20px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        <Link
          href="/admin/dashboard/events"
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(168,85,247,0.2)",
            fontSize: "11px",
            color: "rgba(245,245,245,0.4)",
            textDecoration: "none",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.1em",
          }}
        >
          ← EVENTS
        </Link>

        <button
          onClick={exportToCSV}
          disabled={!registrations.length}
          style={{
            padding: "8px 20px",
            borderRadius: "8px",
            background: registrations.length ? "linear-gradient(135deg, #22543d, #48BB78)" : "rgba(255,255,255,0.05)",
            color: registrations.length ? "#fff" : "rgba(245,245,245,0.2)",
            fontSize: "11px",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.1em",
            border: "none",
            cursor: registrations.length ? "pointer" : "not-allowed",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          EXPORT TO CSV / EXCEL
        </button>

        <span style={{ fontSize: "11px", color: "rgba(245,245,245,0.2)", fontFamily: "var(--font-display)" }}>
          {registrations.length} TOTAL
        </span>
      </div>

      {registrations.length === 0 ? (
        <div style={{
          padding: "60px",
          textAlign: "center",
          color: "rgba(245,245,245,0.3)",
          background: "rgba(107,33,168,0.04)",
          borderRadius: "16px",
          border: "1px solid rgba(168,85,247,0.08)",
        }}>
          <p style={{ fontSize: "16px", marginBottom: "8px" }}>No registrations yet</p>
          <p style={{ fontSize: "12px" }}>Registrations will appear here when users sign up</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "16px", border: "1px solid rgba(168,85,247,0.12)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "rgba(107,33,168,0.1)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(168,85,247,0.6)", fontSize: "10px", fontFamily: "var(--font-display)", letterSpacing: "0.12em", fontWeight: 600 }}>#</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(168,85,247,0.6)", fontSize: "10px", fontFamily: "var(--font-display)", letterSpacing: "0.12em", fontWeight: 600 }}>NAME</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(168,85,247,0.6)", fontSize: "10px", fontFamily: "var(--font-display)", letterSpacing: "0.12em", fontWeight: 600 }}>EMAIL</th>
                {formKeysList.map((key) => (
                  <th key={key} style={{ padding: "12px 16px", textAlign: "left", color: "rgba(168,85,247,0.6)", fontSize: "10px", fontFamily: "var(--font-display)", letterSpacing: "0.12em", fontWeight: 600 }}>
                    {key.toUpperCase()}
                  </th>
                ))}
                <th style={{ padding: "12px 16px", textAlign: "left", color: "rgba(168,85,247,0.6)", fontSize: "10px", fontFamily: "var(--font-display)", letterSpacing: "0.12em", fontWeight: 600 }}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg, i) => (
                <tr
                  key={reg.id}
                  style={{
                    borderTop: "1px solid rgba(168,85,247,0.06)",
                    background: i % 2 === 0 ? "transparent" : "rgba(168,85,247,0.02)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(168,85,247,0.02)"; }}
                >
                  <td style={{ padding: "10px 16px", color: "rgba(245,245,245,0.3)" }}>{i + 1}</td>
                  <td style={{ padding: "10px 16px", color: "#F5F5F5", fontWeight: 500 }}>{reg.user_name || "—"}</td>
                  <td style={{ padding: "10px 16px", color: "rgba(245,245,245,0.5)" }}>{reg.user_email}</td>
                  {formKeysList.map((key) => (
                    <td key={key} style={{ padding: "10px 16px", color: "rgba(245,245,245,0.5)" }}>
                      {reg.form_data?.[key] || "—"}
                    </td>
                  ))}
                  <td style={{ padding: "10px 16px", color: "rgba(245,245,245,0.3)", fontSize: "11px" }}>
                    {new Date(reg.registered_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
