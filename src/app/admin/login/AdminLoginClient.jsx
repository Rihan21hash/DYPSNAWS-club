"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";

export default function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, isAdmin, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect
  useEffect(() => {
    if (!authLoading) {
      if (user && isAdmin) {
        router.replace("/admin/dashboard");
      }
    }
  }, [user, isAdmin, authLoading, router]);

  // Handle URL error param
  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "unauthorized") {
      setError("This account is not authorized for admin access.");
    } else if (urlError === "auth_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data?.user) {
        const res = await fetch("/api/auth/me");
        const me = await res.json();

        if (me.isAdmin) {
          router.replace("/admin/dashboard");
        } else {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          await supabase.auth.signOut();
          setError("Access denied. This account does not have admin privileges.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="bg-[#fdf8f8] min-h-screen flex flex-col text-[#1c1b1b]">
        {/* Navigation Bar / Brand Header */}
        <header className="w-full border-b border-black/10 bg-white/60 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-[1440px] mx-auto px-5 md:px-16 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/BuilderLogo.png"
                alt="AWS Student Builder Group Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
              <span className="font-mono-label text-sm md:text-base font-extrabold tracking-tight text-[#131313]">
                AWS Student Builder Group
              </span>
            </Link>

            <span className="font-mono-label text-xs font-bold uppercase tracking-widest text-[#131313] bg-black/5 px-3 py-1 rounded-full border border-black/10">
              Admin Portal
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center px-5 py-12 md:py-20">
          <div className="w-full max-w-[460px]">
            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono-label text-xs uppercase tracking-widest text-gray-500 hover:text-[#131313] transition-colors mb-6"
            >
              ← Back to site
            </Link>

            {/* Admin Login Card */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#131313]" />

              {/* Header */}
              <div className="mb-8">
                <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-[11px] uppercase tracking-widest text-gray-600 bg-[#f1edec] mb-3">
                  00 / ADMIN AUTH
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#131313] tracking-tight mb-2">
                  Admin Sign In.
                </h1>
                <p className="font-body-md text-sm text-gray-600">
                  Authorized personnel access to manage website content.
                </p>
              </div>

              {/* Status Message */}
              {error && (
                <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Email */}
                <div>
                  <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="captain@dypsn.com"
                    className="w-full bg-[#f7f3f2] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#131313] placeholder-gray-400 focus:outline-none focus:border-[#131313] focus:bg-white transition-all font-sans"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#f7f3f2] border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-[#131313] placeholder-gray-400 focus:outline-none focus:border-[#131313] focus:bg-white transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black p-1 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#131313] hover:bg-black text-white text-xs font-mono-label font-bold tracking-widest uppercase transition-all duration-300 hover:scale-[1.01] shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {loading ? "Verifying Access…" : "Sign In to Admin Panel"}
                </button>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
