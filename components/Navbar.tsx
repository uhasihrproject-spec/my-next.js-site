"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";
import { useAuthUser, refreshAuthUser } from "./useAuthUser";

const LINKS = [
  { label: "Features", href: "/#features", id: "features" },
  { label: "Assets",   href: "/#assets",   id: "assets" },
  { label: "Pricing",  href: "/#pricing",  id: "pricing" },
  { label: "FAQ",      href: "/#faq",      id: "faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loaded } = useAuthUser();
  const [active, setActive] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Scroll-spy: highlight the nav link for whichever section is currently in view.
  // Only runs on the home page where the section anchors exist.
  useEffect(() => {
    if (pathname !== "/") { setActive(null); return; }

    const targets = LINKS
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;

    // Track each section's intersection ratio; pick the most-visible one.
    const ratios = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        }
        let best: string | null = null;
        let bestRatio = 0;
        ratios.forEach((r, id) => { if (r > bestRatio) { best = id; bestRatio = r; } });
        // Require a meaningful slice in view before lighting up.
        setActive(bestRatio > 0.18 ? best : null);
      },
      {
        // Bias toward the section sitting in the upper-middle of the viewport.
        rootMargin: "-15% 0px -45% 0px",
        threshold: [0, 0.18, 0.35, 0.6, 0.85, 1],
      }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshAuthUser();
    router.push("/");
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl border-b border-[var(--line-1)]" : "border-b border-transparent"
      }`}
      style={{ backgroundColor: scrolled ? "color-mix(in srgb, var(--surface-0) 88%, transparent)" : "transparent" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center">
          <Logo size={24} withWord wordSize={15} wordClassName="text-white" gap={10} />
        </Link>

        <nav className="hidden md:flex items-center relative">
          {LINKS.map((n) => {
            const isActive = active === n.id;
            return (
              <Link
                key={n.label}
                href={n.href}
                className={`relative px-3.5 py-1.5 text-[13px] font-light transition-colors ${
                  isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="navActivePill"
                    transition={{ type: "spring", stiffness: 420, damping: 36, mass: 0.7 }}
                    className="absolute inset-0 rounded-full -z-10"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--fg-1) 7%, transparent)",
                    }}
                  />
                )}
                <span className="relative">{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {loaded && (user ? (
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
          ))}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle compact />
        <button onClick={() => setOpen(!open)} className="flex flex-col gap-[5px] w-9 h-9 items-center justify-center" aria-label="Menu">
          <span className={`h-px w-5 bg-zinc-400 transition-all ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`h-px w-5 bg-zinc-400 transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`h-px w-5 bg-zinc-400 transition-all ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-80" : "max-h-0"} border-b border-[var(--line-1)]`} style={{ backgroundColor: "var(--surface-0)" }}>
        <div className="px-6 pt-2 pb-5 flex flex-col gap-0.5">
          {LINKS.map((n) => {
            const isActive = active === n.id;
            return (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`py-2.5 text-[13px] font-light flex items-center justify-between ${
                  isActive ? "text-white" : "text-zinc-500"
                }`}
              >
                <span>{n.label}</span>
                {isActive && <span className="h-1 w-1 rounded-full bg-blue-400" />}
              </Link>
            );
          })}
          <div className="h-px bg-white/[0.05] my-2" />
          {loaded && (user ? (
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
          ))}
        </div>
      </div>
    </header>
  );
}
