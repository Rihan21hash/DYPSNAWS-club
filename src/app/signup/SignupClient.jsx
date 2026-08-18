"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";

const CURRENT_YEAR = new Date().getFullYear();
const ADMISSION_YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i);
const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function SignupClient() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    admissionYear: "",
    academicYear: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.admissionYear) return "Please select your admission year.";
    if (!form.academicYear) return "Please select your current academic year.";
    if (!form.email.includes("@")) return "Please enter a valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await signUp(
        form.email,
        form.password,
        {
          full_name: form.fullName,
          admission_year: parseInt(form.admissionYear, 10),
          academic_year: form.academicYear,
        }
      );

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setSuccess("Account created successfully! Redirecting…");
      setTimeout(() => router.replace("/"), 1200);
    } catch {
      setError("Something went wrong. Please try again.");
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

            <span className="font-mono-label text-lg font-black tracking-[0.2em] text-[#131313] border-l border-black/20 pl-4 py-1 select-none">
              DYPSN
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center px-5 py-12 md:py-20">
          <div className="w-full max-w-[540px]">
            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono-label text-xs uppercase tracking-widest text-gray-500 hover:text-[#131313] transition-colors mb-6"
            >
              ← Back to site
            </Link>

            {/* Registration Card */}
            <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#131313]" />

              {/* Header */}
              <div className="mb-8">
                <span className="inline-block px-3 py-1 border border-gray-300 rounded-full font-mono-label text-[11px] uppercase tracking-widest text-gray-600 bg-[#f1edec] mb-3">
                  01 / REGISTRATION
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#131313] tracking-tight mb-2">
                  Join AWS Builders.
                </h1>
                <p className="font-body-md text-sm text-gray-600">
                  Create your account to participate in events, quizzes, and workshops.
                </p>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="p-3.5 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3.5 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                  {success}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Full Name */}
                <div>
                  <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full bg-[#f7f3f2] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#131313] placeholder-gray-400 focus:outline-none focus:border-[#131313] focus:bg-white transition-all font-sans"
                  />
                </div>

                {/* Admission & Academic Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                      Admission Year
                    </label>
                    <select
                      required
                      value={form.admissionYear}
                      onChange={(e) => update("admissionYear", e.target.value)}
                      className="w-full bg-[#f7f3f2] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#131313] focus:outline-none focus:border-[#131313] focus:bg-white transition-all font-sans cursor-pointer"
                    >
                      <option value="" disabled>Select Year</option>
                      {ADMISSION_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                      Academic Year
                    </label>
                    <select
                      required
                      value={form.academicYear}
                      onChange={(e) => update("academicYear", e.target.value)}
                      className="w-full bg-[#f7f3f2] border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#131313] focus:outline-none focus:border-[#131313] focus:bg-white transition-all font-sans cursor-pointer"
                    >
                      <option value="" disabled>Select Year</option>
                      {ACADEMIC_YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@college.edu"
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
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Min. 6 characters"
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

                {/* Confirm Password */}
                <div>
                  <label className="font-mono-label text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1.5 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      placeholder="Repeat password"
                      className={`w-full bg-[#f7f3f2] border rounded-xl px-4 py-3 pr-11 text-sm text-[#131313] placeholder-gray-400 focus:outline-none focus:bg-white transition-all font-sans ${
                        form.confirmPassword && form.password !== form.confirmPassword
                          ? "border-red-400 focus:border-red-500"
                          : "border-gray-200 focus:border-[#131313]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black p-1 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showConfirm ? "visibility_off" : "visibility"}
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
                  {loading ? "Creating Account…" : "Create Account"}
                </button>
              </form>

              {/* Login link */}
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-[#131313] hover:underline underline-offset-4 ml-1"
                  >
                    Sign In →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
