"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, isAdmin, loading, signOut } = useAuth();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu and dropdown on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // Don't show public navbar on admin pages
  if (pathname.startsWith("/admin")) return null;

  const links = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Team", href: "/team" },
    { label: "Quiz", href: "/quiz" },
    { label: "Certificates", href: "/certifications" },
  ];

  const displayName =
    user?.user_metadata?.full_name || user?.email || "User";
  const userInitial = displayName[0]?.toUpperCase() || "U";

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    router.push("/");
  };

  return (
    <>
      <nav className="bg-white/30 backdrop-blur-md border-b border-black/10 shadow-sm fixed top-0 w-full z-50 transition-all duration-300">
        <div className="flex justify-between items-center px-5 md:px-16 max-w-[1440px] mx-auto h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center rounded-sm">
              <Image
                src="/BuilderLogo.png"
                alt="AWS Student Builder Group Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="font-mono-label text-sm md:text-base lg:text-lg font-extrabold tracking-tight text-[#131313] flex items-center gap-1.5">
              <span>AWS Student Builder Group</span>
            </div>
          </Link>

          {/* Centered Desktop Nav Links */}
          <div className="hidden md:flex gap-8 items-center font-body-md text-sm">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    isActive
                      ? "text-[#131313] font-semibold border-b-2 border-black"
                      : "text-[#5d5f5f] hover:text-[#131313]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Buttons & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#ae5cff] to-[#6324d6] text-white font-bold text-sm border border-black/10 shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      {userInitial}
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-[#0c0914] border border-[#2d254d]/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[99] animate-fadeIn">
                        <div className="px-5 py-4 border-b border-[#2d254d]/40">
                          <p className="text-xs font-semibold text-white truncate">
                            {displayName}
                          </p>
                          <p className="text-[10px] text-white/40 truncate mt-0.5">
                            {user.email}
                          </p>
                        </div>
                        <div className="py-1">
                          {isAdmin && (
                            <Link
                              href="/admin/dashboard"
                              className="flex items-center gap-3 px-5 py-3 text-xs text-white/80 hover:text-white hover:bg-white/[0.04] transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ae5cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                              </svg>
                              Admin Dashboard
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-5 py-3 text-xs text-red-400 hover:bg-red-500/5 transition-colors bg-transparent border-none text-left cursor-pointer"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                              <polyline points="16 17 21 12 16 7" />
                              <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-xs tracking-wider font-bold text-[#131313] hover:text-black transition-colors"
                    >
                      SIGN IN
                    </Link>
                    <Link
                      href="/signup"
                      className="px-5 py-2 text-xs tracking-wider font-bold rounded-full bg-[#131313] hover:bg-black text-white hover:scale-105 transition-all duration-300"
                    >
                      SIGN UP
                    </Link>
                  </div>
                )}
              </>
            )}

            <span className="font-mono-label text-xl font-black tracking-[0.2em] text-[#131313] border-l border-black/20 pl-4 py-1 hidden md:block select-none">
              DYPSN
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-900 flex items-center justify-center p-1 cursor-pointer"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9997] bg-white/95 backdrop-blur-xl md:hidden pt-24 px-6 flex flex-col justify-between pb-12">
          <nav className="flex flex-col gap-3">
            {/* User details on Mobile */}
            {!loading && user && (
              <div className="px-6 py-4 mb-2 bg-[#0c0914] text-white rounded-xl border border-[#2d254d]/60">
                <p className="text-sm font-bold">{displayName}</p>
                <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
              </div>
            )}

            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-6 py-4 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? "bg-black text-white font-bold"
                      : "text-gray-800 hover:bg-black/5 bg-gray-50 border border-black/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {!loading && (
              <>
                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        className="px-6 py-4 rounded-xl text-base font-medium text-[#ae5cff] bg-[#ae5cff]/5 border border-[#ae5cff]/20 flex items-center gap-2"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full px-6 py-4 rounded-xl text-base font-semibold text-red-500 bg-red-50 border border-red-200/50 hover:bg-red-100 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      className="w-full px-6 py-4 rounded-xl text-base font-semibold text-gray-800 bg-gray-50 border border-black/10 flex items-center justify-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full px-6 py-4 rounded-xl text-base font-semibold text-white bg-black hover:bg-black/90 flex items-center justify-center"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>

          <div className="text-center pt-8 border-t border-gray-200">
            <p className="font-mono-label text-xs text-gray-500 tracking-widest mb-2">
              AWS STUDENT BUILDER GROUP
            </p>
            <p className="font-body-md text-xs text-gray-800 font-semibold">
              BUILD • LEARN • DEPLOY
            </p>
          </div>
        </div>
      )}
    </>
  );
}
