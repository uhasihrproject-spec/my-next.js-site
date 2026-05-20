"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const TIERS = [
  {
    name: "Starter",
    apy: "8%",
    sub: "Any amount",
    features: ["All 20 coins", "30-day lock-up", "Personal dashboard", "24–48h withdrawals"],
    primary: false,
  },
  {
    name: "Growth",
    apy: "12%",
    sub: "$1,000+",
    features: ["Everything in Starter", "Flexible lock-up", "Priority confirmation", "Monthly report"],
    primary: true,
  },
  {
    name: "Premium",
    apy: "18%",
    sub: "$10,000+",
    features: ["Everything in Growth", "Custom lock-up", "Priority withdrawals", "Direct admin line"],
    primary: false,
  },
];

export default function Pricing() {
  return (
    <section className="bg-[#111113] py-28 px-6 overflow-hidden" id="pricing">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <p className="text-[11px] font-light tracking-widest text-zinc-600 uppercase mb-3">Tiers</p>
          <h2 className="text-[clamp(32px,5vw,58px)] font-light text-white tracking-tight leading-[1.1]">
            Pick your rate.
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-3">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className={`relative rounded-2xl p-6 flex flex-col border transition-colors ${
                tier.primary
                  ? "bg-[#131b2e] border-blue-500/[0.18]"
                  : "bg-[#1a1a1e] border-white/[0.05] hover:border-white/[0.09]"
              }`}
            >
              {tier.primary && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 rounded-b-lg">
                  <span className="text-[9px] font-normal tracking-widest uppercase text-white">Popular</span>
                </div>
              )}

              <div className="mb-6 mt-2">
                <p className="text-[10px] font-light tracking-widest text-zinc-600 uppercase mb-3">{tier.name}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[44px] font-light text-white leading-none">{tier.apy}</span>
                  <span className="text-[13px] font-light text-zinc-600">APY</span>
                </div>
                <p className="text-[11px] font-light text-zinc-600 mt-1">{tier.sub}</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[12px] font-light text-zinc-500">
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: tier.primary ? "#3b82f6" : "#52525b" }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/signup"
                className={`w-full py-2.5 rounded-xl text-[13px] font-normal text-center transition-all ${
                  tier.primary
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "border border-white/[0.07] hover:border-white/[0.13] text-zinc-500 hover:text-zinc-200"
                }`}
              >
                Get started
              </Link>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[11px] font-light text-zinc-700 mt-7">
          No hidden fees · No ID to start · Withdraw after lock-up
        </p>
      </div>
    </section>
  );
}
