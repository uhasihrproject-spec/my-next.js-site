"use client";

import { motion } from "framer-motion";
import { Apple, Play, Bell, Lock, Eye } from "lucide-react";
import Logo from "./Logo";

export default function MobileApp() {
  return (
    <section className="relative bg-[var(--surface-0)] py-32 px-6 overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.32, 0.18] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/2 right-[12%] -translate-y-1/2 w-[420px] h-[420px] bg-blue-700/[0.14] rounded-full blur-[150px]"
      />

      <div className="relative z-10 max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
        {/* ── Copy ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/[0.08] border border-blue-500/20 mb-6"
          >
            <Bell className="w-3 h-3 text-blue-400" />
            <span className="text-[11px] font-normal text-blue-400 tracking-wide">Mobile app</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(34px,5.5vw,56px)] font-light text-[var(--fg-1)] tracking-tight leading-[1.04] mb-5"
          >
            VaultX in your<br />
            <span className="text-blue-400">pocket — coming soon.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[14px] font-light text-[var(--fg-3)] leading-relaxed mb-8 max-w-md"
          >
            Track your portfolio, deposit, withdraw and get instant alerts — wherever you are.
            The VaultX app for iOS and Android is on the way.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            {[
              { Icon: Apple, top: "Coming soon on", bottom: "the App Store" },
              { Icon: Play, top: "Coming soon on", bottom: "Google Play" },
            ].map(({ Icon, top, bottom }) => (
              <div key={bottom}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--surface-1)] border border-[var(--line-1)] cursor-default">
                <Icon className="w-6 h-6 text-[var(--fg-3)]" />
                <div className="leading-tight">
                  <p className="text-[9px] font-light text-[var(--fg-4)] uppercase tracking-wider">{top}</p>
                  <p className="text-[13px] font-normal text-[var(--fg-2)]">{bottom}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Phone mockup (kept dark in both themes — like a real product screenshot) ── */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -4 }}
          whileInView={{ opacity: 1, y: 0, rotate: -4 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
          data-keep-dark
        >
          <div className="relative w-[240px] h-[490px] rounded-[2.7rem] p-[5px] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            style={{ background: "linear-gradient(150deg, #2a2a2e 0%, #18181a 60%, #0c0c0d 100%)" }}>
            {/* notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[78px] h-[22px] rounded-b-2xl z-30"
              style={{ background: "#000" }} />

            {/* screen */}
            <div className="relative w-full h-full rounded-[2.25rem] overflow-hidden flex flex-col"
              style={{ background: "#0a0a0c" }}>

              {/* status bar */}
              <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[9px] font-medium text-white/90">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span className="block w-3 h-2 rounded-[1px] bg-white/80" />
                  <span className="block w-3 h-2 rounded-[1px] bg-white/40" />
                </div>
              </div>

              {/* header */}
              <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Logo size={18} />
                  <span className="text-[12px] font-normal text-white tracking-wide">VaultX</span>
                </div>
                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Lock className="w-2 h-2 text-blue-200/70" />
                  <span className="text-[7.5px] font-light text-blue-100/70 tracking-wider">Secured</span>
                </div>
              </div>

              {/* Premium balance card — mirrors the real BalanceStack */}
              <div className="mx-3 relative">
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-[90%] h-full rounded-2xl"
                  style={{ background: "#101733", border: "1px solid rgba(255,255,255,0.04)" }} />
                <div className="relative rounded-2xl p-3.5 overflow-hidden border"
                  style={{
                    background: "linear-gradient(150deg, #f7931a40 0%, #17244e 38%, #0c1330 74%, #0a0e1c 100%)",
                    borderColor: "rgba(255,255,255,0.10)",
                  }}>
                  {/* coin glow */}
                  <div className="absolute -top-10 -right-8 w-32 h-32 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(247,147,26,0.30) 0%, transparent 70%)" }} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[8px] font-normal tracking-[0.18em] text-blue-300/65 uppercase">Portfolio</p>
                      <Eye className="w-3 h-3 text-blue-100/50" />
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-semibold"
                        style={{ background: "linear-gradient(135deg, #f7931a, #f7931acc)", color: "#fff" }}>
                        ₿
                      </div>
                      <span className="text-[8.5px] font-normal tracking-wider uppercase" style={{ color: "#f7931a" }}>
                        BTC · Bitcoin
                      </span>
                    </div>
                    <p className="text-[22px] font-light text-white font-mono leading-none">0.4821</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      <p className="text-[9.5px] font-light text-emerald-400 font-mono">+0.0116</p>
                      <span className="text-[8px] font-light text-emerald-400/70">+2.4%</span>
                    </div>

                    {/* Footer — vault number censored */}
                    <div className="mt-3 pt-2.5 flex items-end justify-between"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <div>
                        <p className="text-[6.5px] font-normal tracking-[0.16em] text-blue-200/40 uppercase mb-0.5">Holder</p>
                        <p className="text-[8.5px] font-light text-zinc-100 uppercase tracking-wide">A. Mensah</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[6.5px] font-normal tracking-[0.16em] text-blue-200/40 uppercase mb-0.5">Vault no.</p>
                        <p className="text-[8.5px] font-mono text-blue-200/90 tracking-[0.12em]">•••• 4821</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset rows — mini */}
              <div className="px-4 mt-6 space-y-2.5">
                {[
                  { sym: "ETH", c: "#627eea", w: 62 },
                  { sym: "SOL", c: "#9945ff", w: 38 },
                  { sym: "USDT", c: "#26a17b", w: 24 },
                ].map((r) => (
                  <div key={r.sym} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-semibold shrink-0"
                      style={{ background: `linear-gradient(135deg, ${r.c}, ${r.c}cc)`, color: "#fff" }}>
                      {r.sym.length > 3 ? r.sym.slice(0, 3) : r.sym}
                    </div>
                    <div className="flex-1 h-[3px] rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full" style={{ width: `${r.w}%`, background: r.c }} />
                    </div>
                    <span className="text-[8.5px] font-light text-zinc-500 tabular-nums w-7 text-right">{r.w}%</span>
                  </div>
                ))}
              </div>

              {/* Deposit CTA */}
              <div className="mt-auto mx-4 mb-5">
                <div className="h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_8px_24px_rgba(37,99,235,0.40)]">
                  <span className="text-[10px] font-normal text-white tracking-wide">+ Deposit funds</span>
                </div>
              </div>
            </div>

            {/* coming soon pill */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 top-24 px-3 py-1.5 rounded-lg bg-white text-black text-[10px] font-semibold shadow-xl z-40"
            >
              Coming soon
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
