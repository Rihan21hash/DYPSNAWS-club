"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminPageClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if already logged in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Verify admin via API
        fetch("/api/auth/me")
          .then((r) => r.json())
          .then((data) => {
            if (data.isAdmin) {
              router.replace("/admin/dashboard");
            } else {
              setCheckingAuth(false);
            }
          })
          .catch(() => setCheckingAuth(false));
      } else {
        setCheckingAuth(false);
      }
    });

    // Check for error in URL params
    const urlError = searchParams.get("error");
    if (urlError === "unauthorized") {
      setError("This account is not authorized for admin access");
    } else if (urlError === "auth_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, [router, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Verify admin status via API
      const res = await fetch("/api/auth/me");
      const meData = await res.json();

      if (meData.isAdmin) {
        router.push("/admin/dashboard");
      } else {
        await supabase.auth.signOut();
        setError("This account is not authorized for admin access");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0F",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid rgba(168,85,247,0.2)",
            borderTopColor: "#A855F7",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-deep/20 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-purple-light/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-purple-light/40 hover:text-purple-light transition-colors mb-8"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ← BACK TO SITE
        </Link>

        <div
          className="glass-card p-8 md:p-10"
          style={{ boxShadow: "0 0 60px rgba(107, 33, 168, 0.15), 0 0 120px rgba(107, 33, 168, 0.05)" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-deep to-purple-light flex items-center justify-center text-white text-lg font-bold mx-auto mb-4" style={{ fontFamily: "var(--font-display)" }}>
              ☁
            </div>
            <h1
              className="text-2xl font-bold text-off-white mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ADMIN LOGIN
            </h1>
            <p className="text-xs text-off-white/30">
              Authorized personnel only
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                background: "rgba(245,100,100,0.1)",
                border: "1px solid rgba(245,100,100,0.2)",
                color: "#F56565",
                fontSize: "13px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-purple-light/50 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-off-white placeholder-off-white/20 outline-none transition-all duration-300"
                style={{
                  borderColor: focused === "email" ? "rgba(168, 85, 247, 0.5)" : "rgba(168, 85, 247, 0.1)",
                  boxShadow: focused === "email" ? "0 0 20px rgba(168, 85, 247, 0.1)" : "none",
                }}
                placeholder="admin@awsclub.dyp"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] tracking-[0.2em] text-purple-light/50 mb-2" style={{ fontFamily: "var(--font-display)" }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border text-sm text-off-white placeholder-off-white/20 outline-none transition-all duration-300"
                style={{
                  borderColor: focused === "password" ? "rgba(168, 85, 247, 0.5)" : "rgba(168, 85, 247, 0.1)",
                  boxShadow: focused === "password" ? "0 0 20px rgba(168, 85, 247, 0.1)" : "none",
                }}
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-[0.15em] text-white bg-gradient-to-r from-purple-deep to-purple-light hover:from-purple-light hover:to-purple-glow transition-all duration-500 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] disabled:opacity-50"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>

          {/* Bottom text */}
          <p className="text-center text-[10px] text-off-white/20 mt-6">
            Powered by Supabase Authentication
          </p>
        </div>
      </div>
    </div>
  );
}
