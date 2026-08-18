"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    signIn,
    signUp,
    signInWithGoogle,
  } = useAuth();

  const [activeTab, setActiveTab] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalTab);
      setError("");
      setSuccess("");
      // Reset inputs
      setName("");
      setEmail("");
      setPassword("");
    }
  }, [isAuthModalOpen, authModalTab]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeAuthModal();
      }
    };
    if (isAuthModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (activeTab === "signin") {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.message);
        } else {
          setSuccess("Welcome back! Signing in...");
          setTimeout(() => {
            closeAuthModal();
          }, 1000);
        }
      } else {
        if (!name.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        const { error: signUpError } = await signUp(email, password, name);
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setSuccess("Account created successfully! Check your email to verify (if required) or sign in.");
          setEmail("");
          setPassword("");
          setName("");
          setActiveTab("signin");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      // Redirect back to current path
      const nextUrl = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
      const { error: googleError } = await signInWithGoogle(nextUrl);
      if (googleError) {
        setError(googleError.message);
        setLoading(false);
      }
    } catch {
      setError("Failed to connect to Google.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#06060c]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={closeAuthModal}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-md bg-[#0c0914] border border-[#2d254d]/60 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(174,92,255,0.15)] flex flex-col transition-all duration-300 transform scale-100"
        style={{
          boxShadow: "0 0 60px rgba(107, 33, 168, 0.15), 0 0 120px rgba(107, 33, 168, 0.05)",
        }}
      >
        {/* Glow Effects */}
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-900/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-900/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-6 right-6 w-8 h-8 rounded-full border border-[#2d254d]/40 flex items-center justify-center text-white/50 hover:text-white hover:border-[#ae5cff]/40 bg-white/[0.02] hover:bg-[#ae5cff]/10 hover:scale-105 cursor-pointer transition-all duration-300"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Content */}
        <div className="p-8 md:p-10 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ae5cff] to-[#6324d6] flex items-center justify-center text-white text-xl font-bold mx-auto mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ☁
            </div>
            <h2
              className="text-2xl font-bold text-white tracking-wide"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {activeTab === "signin" ? "WELCOME BACK" : "CREATE ACCOUNT"}
            </h2>
            <p className="text-xs text-white/40 mt-1">
              {activeTab === "signin"
                ? "Sign in to access your cloud builder profile"
                : "Join the DYPSN AWS Student Builder Group"}
            </p>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center transition-all animate-fadeIn">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center transition-all animate-fadeIn">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {activeTab === "signup" && (
              <div className="relative">
                <label className="block text-[10px] tracking-[0.2em] text-[#ae5cff]/60 mb-2 font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Alex Smith"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border text-sm text-white placeholder-white/20 outline-none transition-all duration-300"
                  style={{
                    borderColor: focusedField === "name" ? "rgba(174, 92, 255, 0.5)" : "rgba(174, 92, 255, 0.1)",
                    boxShadow: focusedField === "name" ? "0 0 20px rgba(174, 92, 255, 0.08)" : "none",
                  }}
                />
              </div>
            )}

            <div className="relative">
              <label className="block text-[10px] tracking-[0.2em] text-[#ae5cff]/60 mb-2 font-bold" style={{ fontFamily: "var(--font-display)" }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="you@domain.com"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border text-sm text-white placeholder-white/20 outline-none transition-all duration-300"
                style={{
                  borderColor: focusedField === "email" ? "rgba(174, 92, 255, 0.5)" : "rgba(174, 92, 255, 0.1)",
                  boxShadow: focusedField === "email" ? "0 0 20px rgba(174, 92, 255, 0.08)" : "none",
                }}
              />
            </div>

            <div className="relative">
              <label className="block text-[10px] tracking-[0.2em] text-[#ae5cff]/60 mb-2 font-bold" style={{ fontFamily: "var(--font-display)" }}>
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border text-sm text-white placeholder-white/20 outline-none transition-all duration-300"
                style={{
                  borderColor: focusedField === "password" ? "rgba(174, 92, 255, 0.5)" : "rgba(174, 92, 255, 0.1)",
                  boxShadow: focusedField === "password" ? "0 0 20px rgba(174, 92, 255, 0.08)" : "none",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-[0.15em] text-white bg-gradient-to-r from-[#ae5cff] to-[#6324d6] hover:from-[#c284ff] hover:to-[#7435ea] cursor-pointer transition-all duration-500 shadow-[0_0_20px_rgba(174,92,255,0.2)] hover:shadow-[0_0_30px_rgba(174,92,255,0.4)] hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : activeTab === "signin" ? (
                "SIGN IN"
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center justify-center gap-3">
            <div className="flex-1 h-[1px] bg-[#2d254d]/40" />
            <span className="text-[10px] tracking-wider text-white/25 uppercase">OR CONTINUE WITH</span>
            <div className="flex-1 h-[1px] bg-[#2d254d]/40" />
          </div>

          {/* Social Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 rounded-xl border border-[#2d254d]/60 bg-white/[0.01] hover:bg-white/[0.04] text-white/80 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 text-sm cursor-pointer hover:border-[#ae5cff]/30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google Account
          </button>

          {/* Toggle Tab */}
          <div className="mt-8 text-center">
            {activeTab === "signin" ? (
              <p className="text-xs text-white/40">
                New toDYPSN AWS Club?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="text-[#ae5cff] hover:text-[#c284ff] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer ml-1"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-white/40">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className="text-[#ae5cff] hover:text-[#c284ff] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer ml-1"
                >
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
