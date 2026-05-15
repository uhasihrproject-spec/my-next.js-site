"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CHIPS = [
  { label: "BTC", color: "#f7931a", val: "+18% APY" },
  { label: "ETH", color: "#627eea", val: "Live tracking" },
  { label: "SOL", color: "#9945ff", val: "2,400+ users" },
];

export default function Hero() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { setUser(d.user || null); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <section className="relative min-h-screen bg-[#161618] flex items-center overflow-hidden pt-16">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.018]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      {/* Blue ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/[0.055] rounded-full blur-[180px]" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 border border-white/[0.07] rounded-full px-4 py-1.5 mb-10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-light tracking-widest text-zinc-500 uppercase">Live · 2,400+ investors</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(44px,6vw,82px)] font-light text-white tracking-tight leading-[1.06] mb-6"
            >
              Earn while<br />
              you <span className="text-blue-400">hold.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="text-[15px] font-light text-zinc-500 mb-10 max-w-[320px] leading-relaxed"
            >
              Deposit any supported coin.<br />We manage it. You earn up to 18% APY.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="flex flex-wrap gap-3"
            >
              {loaded && (
                user ? (
                  <Link href={user.role === "admin" ? "/admin" : "/dashboard"}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-xl transition-colors">
                    {user.role === "admin" ? "Admin panel" : "Dashboard"} →
                  </Link>
                ) : (
                  <Link href="/signup"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-xl transition-colors">
                    Open free account →
                  </Link>
                )
              )}
              <Link href="/#how"
                className="px-6 py-3 border border-white/[0.08] hover:border-white/[0.14] text-zinc-500 hover:text-zinc-300 text-[13px] font-light rounded-xl transition-all">
                How it works
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              className="mt-14 pt-8 border-t border-white/[0.05] flex gap-10"
            >
              {[["18%", "Max APY"], ["6", "Coins"], ["$47M+", "Managed"]].map(([v, l]) => (
                <div key={l}>
                  <p className="text-xl font-light text-white">{v}</p>
                  <p className="text-[11px] font-light text-zinc-600 mt-0.5">{l}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — coin visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex items-center justify-center relative h-[480px]"
          >
            {/* Glow ring */}
            <div className="absolute w-[340px] h-[340px] rounded-full bg-blue-600/[0.07] blur-[80px]" />
            {/* Orbit rings */}
            <div className="absolute w-[340px] h-[340px] rounded-full border border-white/[0.03]" />
            <div className="absolute w-[260px] h-[260px] rounded-full border border-white/[0.04]" />
            {/* Spinning ring */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className="absolute w-[310px] h-[310px] rounded-full border border-transparent border-t-blue-500/20 border-r-blue-500/10" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="absolute w-[240px] h-[240px] rounded-full border border-transparent border-b-blue-400/15" />

            {/* BTC coin */}
            <motion.div
              animate={{ y: [0, -16, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-[#f7931a] to-[#e07d10] flex items-center justify-center shadow-[0_0_50px_rgba(247,147,26,0.3)]"
            >
              <span className="text-white text-5xl font-light select-none" style={{ fontFamily: "serif" }}>₿</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 via-transparent to-white/15" />
            </motion.div>

            {/* Chips */}
            {CHIPS.map((c, i) => {
              const positions = ["top-[18%] right-[10%]", "top-[18%] left-[8%]", "bottom-[20%] right-[6%]"];
              return (
                <motion.div key={c.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + i * 0.12, duration: 0.4, ease: "backOut" }}
                  className={`absolute ${positions[i]} flex items-center gap-2 bg-[#1e1e22]/90 border border-white/[0.07] rounded-xl px-3 py-2 backdrop-blur-sm`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <div>
                    <p className="text-[10px] font-light text-zinc-600">{c.label}</p>
                    <p className="text-[12px] font-normal text-white leading-tight">{c.val}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#161618] to-transparent" />
    </section>
  );
}
