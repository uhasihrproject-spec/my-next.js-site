"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TrendingUp, Menu, X, LayoutDashboard, LogOut, Shield } from "lucide-react";

interface AuthUser {
  name: string;
  role: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ? { name: d.user.name, role: d.user.role } : null))
      .catch(() => setUser(null));
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  const linkClass = (href: string) =>
    `transition-colors duration-200 ${
      pathname === href ? "text-blue-400 font-semibold" : "text-gray-300 hover:text-white"
    }`;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-[#050510]/80 border-b border-white/8 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex justify-between items-center h-18 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VaultX
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link href="/features" className={linkClass("/features")}>Features</Link>
            <Link href="/stats" className={linkClass("/stats")}>Live Stats</Link>
            <Link href="/faq" className={linkClass("/faq")}>FAQ</Link>

            {user ? (
              <>
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
                >
                  {user.role === "admin" ? (
                    <Shield className="w-3.5 h-3.5 text-yellow-400" />
                  ) : (
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  {user.role === "admin" ? "Admin" : "Dashboard"}
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={linkClass("/login")}>Login</Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20 text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden px-6 pb-5 bg-[#050510]/95 backdrop-blur-md border-t border-white/8 text-sm">
          <div className="flex flex-col gap-1 pt-3">
            {[
              { href: "/features", label: "Features" },
              { href: "/stats", label: "Live Stats" },
              { href: "/faq", label: "FAQ" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  pathname === href
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}

            <div className="border-t border-white/8 mt-2 pt-2">
              {user ? (
                <>
                  <Link
                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {user.role === "admin" ? (
                      <Shield className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <LayoutDashboard className="w-4 h-4 text-blue-400" />
                    )}
                    {user.role === "admin" ? "Admin Panel" : "My Dashboard"}
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block mt-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
