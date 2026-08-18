"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";

export default function SettingsPage() {
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (!newEmail && !newPassword) {
      setMessage({ type: "error", text: "Please enter a new email or password" });
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const updates = {};
      if (newEmail) updates.email = newEmail;
      if (newPassword) updates.password = newPassword;

      const { error } = await supabase.auth.updateUser(updates);

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: newEmail
            ? "Check your new email inbox for a confirmation link."
            : "Password updated successfully!",
        });
        setNewEmail("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      badge="06 / SETTINGS"
      title="Admin Settings."
      subtitle="Manage your administrator credentials and account security"
    >
      <form onSubmit={handleSubmit} className="max-w-[560px] flex flex-col gap-6">
        {message.text && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Change Email Card */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
          <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-4 pb-3 border-b border-gray-100">
            Change Email Address
          </h3>
          <div>
            <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
              New Email (leave blank to keep current)
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="admin@college.edu"
              className="w-full bg-[#f7f3f2] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#131313] placeholder-gray-400 focus:outline-none focus:border-[#131313] focus:bg-white transition-all font-sans"
            />
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
          <h3 className="font-mono-label text-xs uppercase font-bold tracking-widest text-[#131313] mb-4 pb-3 border-b border-gray-100">
            Change Password
          </h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                minLength={6}
                className="w-full bg-[#f7f3f2] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#131313] placeholder-gray-400 focus:outline-none focus:border-[#131313] focus:bg-white transition-all font-sans"
              />
            </div>
            <div>
              <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full bg-[#f7f3f2] border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#131313] placeholder-gray-400 focus:outline-none focus:border-[#131313] focus:bg-white transition-all font-sans"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-6 rounded-full bg-[#131313] hover:bg-black text-white text-xs font-mono-label font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.01] shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? "Updating Credentials…" : "Update Credentials"}
        </button>
      </form>
    </AdminLayout>
  );
}
