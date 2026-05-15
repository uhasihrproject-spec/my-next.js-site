"use client";

import { motion } from "framer-motion";
import Link from "next/link";

function DashMockup() {
  const bars = [28, 38, 33, 50, 44, 60, 55, 72, 66, 85, 78, 100];
  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      <div className="absolute -inset-6 bg-blue-600/[0.04] rounded-3xl blur-[50px]" />
      <div className="relative bg-[#1a1a1e] border border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05] bg-[#161618]">
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="ml-3 flex-1 bg-white/[0.03] rounded h-4 flex items-center px-2">
            <span className="text-[8px] font-light text-zinc-700">app.vaultx.io/dashboard</span>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Balance */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-light text-zinc-600 mb-1">Total Balance</p>
              <p className="text-[26px] font-light text-white">$24,830</p>
              <p className="text-[11px] font-light text-emerald-400 mt-0.5">+$2,104 this month</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-400/[0.06] border border-emerald-400/20 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-light text-emerald-400">Active</span>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-[#161618] rounded-xl p-3 border border-white/[0.04]">
            <p className="text-[9px] font-light text-zinc-700 mb-2 tracking-widest uppercase">12-month growth</p>
            <div className="flex items-end gap-[3px] h-12">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 rounded-t-[1px]"
                  style={{ height: `${h}%`, backgroundColor: i === bars.length - 1 ? "#3b82f6" : `rgba(59,130,246,${0.08 + (i / bars.length) * 0.28})` }} />
              ))}
            </div>
          </div>

          {/* Holdings */}
          <div className="space-y-3">
            {[
              { c: "BTC", v: "0.21 BTC", u: "$14,220", pct: 57, col: "#f7931a" },
              { c: "ETH", v: "1.84 ETH", u: "$6,590",  pct: 27, col: "#627eea" },
              { c: "SOL", v: "22.5 SOL", u: "$4,020",  pct: 16, col: "#9945ff" },
            ].map((r) => (
              <div key={r.c} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[8px] font-normal border border-white/[0.06] shrink-0"
                  style={{ backgroundColor: r.col + "15", color: r.col }}>{r.c}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-light text-zinc-300">{r.v}</span>
                    <span className="text-[11px] font-light text-zinc-500">{r.u}</span>
                  </div>
                  <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${r.pct}%` }}
                      viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.4 }}
                      className="h-full rounded-full" style={{ backgroundColor: r.col }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-blue-600/[0.06] border border-blue-600/[0.12] rounded-xl">
            <span className="text-[11px] font-light text-zinc-500">Unlock in</span>
            <span className="text-[11px] font-light text-blue-400">18 days</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeatureShowcase() {
  return (
    <section className="bg-[#161618] py-28 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <DashMockup />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <p className="text-[11px] font-light tracking-widest text-blue-400/70 uppercase mb-4">Dashboard</p>
            <h2 className="text-[clamp(30px,4.5vw,52px)] font-light text-white tracking-tight leading-[1.1] mb-5">
              Full visibility.<br />
              <span className="text-zinc-500">Always.</span>
            </h2>
            <p className="text-[14px] font-light text-zinc-500 leading-relaxed mb-8 max-w-[300px]">
              Every coin, every cent — tracked live on your personal dashboard.
            </p>

            <ul className="space-y-3 mb-8">
              {["Real-time balance per coin", "Earnings tracked separately", "Full transaction history", "APY calculator built-in"].map((b) => (
                <li key={b} className="flex items-center gap-3 text-[13px] font-light text-zinc-500">
                  <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <Link href="/signup" className="inline-flex items-center gap-1.5 text-[13px] font-normal text-blue-400 hover:text-blue-300 transition-colors">
              Open account →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
