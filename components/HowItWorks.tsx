"use client";

import { motion } from "framer-motion";

const STEPS = [
  { n: "01", title: "Create account",       tag: "Free" },
  { n: "02", title: "Send your crypto",     tag: "20 coins supported" },
  { n: "03", title: "We grow it",           tag: "Up to 18% APY" },
  { n: "04", title: "Withdraw anytime",     tag: "After lock-up" },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#111113] py-28 px-6 overflow-hidden" id="how">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="text-[11px] font-light tracking-widest text-zinc-600 uppercase mb-3">Process</p>
          <h2 className="text-[clamp(32px,5vw,58px)] font-light text-white tracking-tight leading-[1.1]">
            Four steps.
          </h2>
        </motion.div>

        <div>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group flex items-center gap-8 py-7 border-b border-white/[0.05] last:border-0 cursor-default"
            >
              <span className="text-[48px] font-light text-zinc-800 group-hover:text-zinc-700 transition-colors leading-none select-none tabular-nums w-16 shrink-0">
                {step.n}
              </span>

              <div className="flex-1 flex items-center justify-between gap-4">
                <h3 className="text-[17px] font-light text-zinc-300 group-hover:text-white transition-colors">
                  {step.title}
                </h3>
                <span className="text-[10px] font-light tracking-widest text-blue-400/70 border border-blue-500/20 rounded-full px-3 py-1 shrink-0 uppercase">
                  {step.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
