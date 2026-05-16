"use client";

import { motion } from "framer-motion";
import { Apple, Play, Bell, TrendingUp } from "lucide-react";

export default function MobileApp() {
  return (
    <section className="relative bg-[#161618] py-32 px-6 overflow-hidden">
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
            className="text-[clamp(34px,5.5vw,56px)] font-light text-white tracking-tight leading-[1.04] mb-5"
          >
            VaultX in your<br />
            <span className="text-blue-400">pocket — coming soon.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[14px] font-light text-zinc-500 leading-relaxed mb-8 max-w-md"
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
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] cursor-default">
                <Icon className="w-6 h-6 text-zinc-400" />
                <div className="leading-tight">
                  <p className="text-[9px] font-light text-zinc-600 uppercase tracking-wider">{top}</p>
                  <p className="text-[13px] font-normal text-zinc-200">{bottom}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Phone mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -4 }}
          whileInView={{ opacity: 1, y: 0, rotate: -4 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
        >
          <div className="relative w-[230px] h-[470px] rounded-[2.6rem] border border-white/[0.1] bg-[#0c0c0d] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            {/* notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-2xl bg-[#0c0c0d] border-x border-b border-white/[0.06] z-20" />
            {/* screen */}
            <div className="w-full h-full rounded-[2.1rem] bg-[#0a0a0b] overflow-hidden flex flex-col">
              <div className="px-4 pt-7 pb-3 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center">
                  <TrendingUp className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-[11px] font-normal text-white">VaultX</span>
              </div>
              {/* card */}
              <div className="mx-4 rounded-2xl p-4 border border-white/[0.08]"
                style={{ background: "linear-gradient(140deg, #1c2233 0%, #13141b 60%, #0e0f14 100%)" }}>
                <p className="text-[8px] font-normal tracking-widest text-blue-300/50 uppercase mb-1.5">Portfolio</p>
                <p className="text-[22px] font-light text-white font-mono leading-none">0.4821</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-light text-emerald-400">+2.4% earning</span>
                </div>
              </div>
              {/* rows */}
              <div className="px-4 mt-4 space-y-2.5">
                {[["#f7931a", "62%"], ["#627eea", "38%"], ["#26a17b", "70%"]].map(([c, w], i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full shrink-0" style={{ backgroundColor: c + "22", border: `1px solid ${c}44` }} />
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: w, backgroundColor: c + "99" }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* bottom bar */}
              <div className="mt-auto mx-4 mb-5 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <span className="text-[10px] font-normal text-white">Deposit</span>
              </div>
            </div>
            {/* coming soon pill */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 top-20 px-3 py-1.5 rounded-lg bg-white text-black text-[10px] font-semibold shadow-xl"
            >
              Coming soon
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
