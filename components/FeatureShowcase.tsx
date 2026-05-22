"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Lock, Eye, ArrowDownToLine, ArrowUpFromLine, Wallet, Activity, LineChart, TrendingUp } from "lucide-react";
import Logo from "./Logo";
import { useAuthUser } from "./useAuthUser";

/**
 * A faithful mini of the real dashboard — sidebar + premium balance card +
 * asset table. Locked to its dark presentation in both themes so it always
 * reads as a product screenshot.
 */
function DashMockup() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto" data-keep-dark>
      <div className="absolute -inset-8 bg-blue-600/[0.06] rounded-[28px] blur-[60px]" />

      <div className="relative rounded-2xl overflow-hidden border"
        style={{ background: "#0a0a0c", borderColor: "rgba(255,255,255,0.07)", boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>

        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b"
          style={{ background: "#0c0c0d", borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
          <div className="ml-3 flex-1 rounded h-5 flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <span className="text-[9px] font-light text-zinc-500">app.vaultx.io / dashboard</span>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-[88px] shrink-0 py-3 px-2 space-y-1"
            style={{ background: "#0c0c0d", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-1.5 px-2 py-1.5 mb-2">
              <Logo size={14} />
              <span className="text-[9px] font-normal text-white">VaultX</span>
            </div>
            {[
              { Icon: TrendingUp, label: "Portfolio", active: true },
              { Icon: LineChart,  label: "Markets",   active: false },
              { Icon: Wallet,     label: "Activity",  active: false },
              { Icon: Activity,   label: "News",      active: false },
            ].map(({ Icon, label, active }) => (
              <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded text-[8.5px] font-light tracking-wide ${
                active ? "text-white" : "text-zinc-600"
              }`} style={{ background: active ? "rgba(255,255,255,0.05)" : "transparent" }}>
                <Icon className={`w-2.5 h-2.5 ${active ? "text-blue-400" : ""}`} />
                {label}
              </div>
            ))}

            <div className="pt-2 mt-2 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-600 text-[8.5px] font-normal text-white">
                <ArrowDownToLine className="w-2.5 h-2.5" /> Deposit
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[8.5px] font-light text-zinc-400"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <ArrowUpFromLine className="w-2.5 h-2.5" /> Withdraw
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 p-4 space-y-3.5"
            style={{ background: "#0a0a0c" }}>
            {/* Heading */}
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-[8px] font-light tracking-[0.18em] text-zinc-700 uppercase mb-0.5">Welcome back</p>
                <p className="text-[12px] font-normal text-white">A. Mensah</p>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.20)" }}>
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-[8px] font-light text-emerald-400">Active</span>
              </div>
            </div>

            {/* Premium balance card */}
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-[92%] h-full rounded-xl"
                style={{ background: "#101733", border: "1px solid rgba(255,255,255,0.04)" }} />
              <div className="relative rounded-xl p-3.5 overflow-hidden border"
                style={{
                  background: "linear-gradient(150deg, #f7931a40 0%, #17244e 38%, #0c1330 74%, #0a0e1c 100%)",
                  borderColor: "rgba(255,255,255,0.10)",
                }}>
                <div className="absolute -top-10 -right-8 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(247,147,26,0.32) 0%, transparent 70%)" }} />
                <div className="absolute -bottom-12 -left-10 w-28 h-28 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, rgba(59,130,246,0.24) 0%, transparent 70%)" }} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Logo size={13} />
                      <span className="text-[8px] font-normal text-white tracking-wide">VaultX</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}>
                        <Eye className="w-2.5 h-2.5 text-blue-100/70" />
                      </div>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}>
                        <Lock className="w-2 h-2 text-blue-200/70" />
                        <span className="text-[7px] font-light text-blue-100/70">Secured</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center text-[6px] font-semibold"
                      style={{ background: "linear-gradient(135deg, #f7931a, #f7931acc)", color: "#fff" }}>
                      ₿
                    </div>
                    <span className="text-[7.5px] font-normal tracking-wider uppercase" style={{ color: "#f7931a" }}>
                      BTC · Bitcoin
                    </span>
                  </div>
                  <p className="text-[22px] font-light text-white font-mono leading-none mb-1">0.21458</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <p className="text-[9px] font-light text-emerald-400 font-mono">+0.00515</p>
                    <span className="text-[8px] font-light text-emerald-400/70">+2.46%</span>
                  </div>

                  <div className="mt-3 pt-2 flex items-end justify-between"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                      <p className="text-[6.5px] font-normal tracking-[0.16em] text-blue-200/40 uppercase mb-0.5">Holder</p>
                      <p className="text-[8px] font-light text-zinc-100 uppercase tracking-wide">A. MENSAH</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[6.5px] font-normal tracking-[0.16em] text-blue-200/40 uppercase mb-0.5">Vault no.</p>
                      <p className="text-[8.5px] font-mono text-blue-200/90 tracking-[0.12em]">•••• 4821</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset rows */}
            <div className="space-y-2 pt-1">
              {[
                { sym: "ETH",  name: "Ethereum",  qty: "1.84 ETH",  usd: "$6,590", pct: 27, col: "#627eea" },
                { sym: "SOL",  name: "Solana",    qty: "22.5 SOL",  usd: "$4,020", pct: 16, col: "#9945ff" },
                { sym: "USDT", name: "Tether",    qty: "1,200 USDT", usd: "$1,200", pct:  9, col: "#26a17b" },
              ].map((r) => (
                <div key={r.sym} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[7.5px] font-semibold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${r.col}, ${r.col}cc)`, color: "#fff", boxShadow: `0 3px 10px -3px ${r.col}80` }}>
                    {r.sym.length > 3 ? r.sym.slice(0, 3) : r.sym}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-normal text-zinc-200">{r.qty}</span>
                      <span className="text-[9.5px] font-light text-zinc-500 tabular-nums">{r.usd}</span>
                    </div>
                    <div className="h-[2px] rounded-full overflow-hidden mt-1"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${r.pct}%` }}
                        viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.4 }}
                        className="h-full rounded-full" style={{ backgroundColor: r.col }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Unlock pill */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg"
              style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)" }}>
              <div className="flex items-center gap-1.5">
                <Lock className="w-2.5 h-2.5 text-blue-400" />
                <span className="text-[9px] font-light text-zinc-500">Withdrawals unlock in</span>
              </div>
              <span className="text-[9px] font-normal text-blue-400">18 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeatureShowcase() {
  const { user, loaded } = useAuthUser();
  const signedIn = loaded && !!user;
  const ctaHref = signedIn ? (user!.role === "admin" ? "/admin" : "/dashboard") : "/signup";
  const ctaLabel = signedIn ? `Open ${user!.role === "admin" ? "admin" : "dashboard"} →` : "Open account →";

  return (
    <section className="bg-[var(--surface-0)] py-28 px-6 overflow-hidden">
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
            <h2 className="text-[clamp(30px,4.5vw,52px)] font-light text-[var(--fg-1)] tracking-tight leading-[1.1] mb-5">
              Full visibility.<br />
              <span className="text-[var(--fg-4)]">Always.</span>
            </h2>
            <p className="text-[14px] font-light text-[var(--fg-3)] leading-relaxed mb-8 max-w-[300px]">
              Every coin, every cent — tracked live on your personal dashboard.
            </p>

            <ul className="space-y-3 mb-8">
              {["Premium credit-card-style balance", "Earnings tracked separately", "Censored vault number", "Real-time prices via CoinGecko"].map((b) => (
                <li key={b} className="flex items-center gap-3 text-[13px] font-light text-[var(--fg-3)]">
                  <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <Link href={ctaHref} className="inline-flex items-center gap-1.5 text-[13px] font-normal text-blue-400 hover:text-blue-300 transition-colors">
              {ctaLabel}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
