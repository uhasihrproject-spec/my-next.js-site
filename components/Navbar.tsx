"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Assets", href: "/#assets" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => null);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-[#161618]/90 backdrop-blur-xl border-b border-white/[0.05]" : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="0.5" fill="white"/>
              <rect x="7" y="0.5" width="4.5" height="4.5" rx="0.5" fill="white" opacity="0.5"/>
              <rect x="0.5" y="7" width="4.5" height="4.5" rx="0.5" fill="white" opacity="0.5"/>
              <rect x="7" y="7" width="4.5" height="4.5" rx="0.5" fill="white" opacity="0.25"/>
            </svg>
          </div>
          <span className="text-white font-medium text-[15px] tracking-wide">VaultX</span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {LINKS.map((n) => (
            <Link key={n.label} href={n.href}
              className="px-4 py-2 text-[13px] font-light text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-white/[0.04] transition-all">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link href={user.role === "admin" ? "/admin" : "/dashboard"}
                className="px-4 py-2 text-[13px] font-light text-zinc-400 hover:text-white transition-colors">
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
              <button onClick={logout} className="px-4 py-2 text-[13px] font-light text-zinc-600 hover:text-zinc-400 transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-[13px] font-light text-zinc-500 hover:text-zinc-200 transition-colors">
                Log in
              </Link>
              <Link href="/signup"
                className="px-4 py-2 text-[13px] font-normal bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-[5px] w-9 h-9 items-center justify-center" aria-label="Menu">
          <span className={`h-px w-5 bg-zinc-400 transition-all ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`h-px w-5 bg-zinc-400 transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`h-px w-5 bg-zinc-400 transition-all ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-80" : "max-h-0"} bg-[#161618] border-b border-white/[0.05]`}>
        <div className="px-6 pt-2 pb-5 flex flex-col gap-0.5">
          {LINKS.map((n) => (
            <Link key={n.label} href={n.href} onClick={() => setOpen(false)}
              className="py-2.5 text-[13px] font-light text-zinc-500 hover:text-white">
              {n.label}
            </Link>
          ))}
          <div className="h-px bg-white/[0.05] my-2" />
          {user ? (
            <>
              <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="py-2.5 text-[13px] font-light text-zinc-400">
                {user.role === "admin" ? "Admin Panel" : "Dashboard"}
              </Link>
              <button onClick={() => { logout(); setOpen(false); }} className="py-2.5 text-[13px] font-light text-zinc-600 text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="py-2.5 text-[13px] font-light text-zinc-500">Log in</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="mt-1 py-2.5 text-[13px] font-normal bg-blue-600 text-white rounded-lg text-center">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
