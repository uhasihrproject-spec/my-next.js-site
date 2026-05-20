"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Create an account",
    desc: "Sign up in under 2 minutes. No ID required to get started.",
  },
  {
    n: "02",
    title: "Send your crypto",
    desc: "Copy our wallet address, send any supported coin, and submit your transaction hash.",
  },
  {
    n: "03",
    title: "We put it to work",
    desc: "Our traders allocate your deposit across active strategies to generate returns.",
  },
  {
    n: "04",
    title: "Withdraw your returns",
    desc: "After your lock-up period, request a withdrawal. Funds arrive within 24–48 hours.",
  },
];

const benefits = [
  "Principal and earnings tracked separately",
  "Per-account custom lock-up periods",
  "Global withdrawal lock for protection",
  "Admin-managed deposit confirmation",
  "20 supported assets including BTC, ETH & SOL",
  "Full transaction history on your dashboard",
];

export default function Features() {
  return (
    <section className="bg-black py-24 px-5 border-t border-white/6">
      <div className="max-w-5xl mx-auto space-y-20">

        {/* How it works */}
        <div>
          <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-4">Process</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-12">
            How it works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <span className="block text-5xl font-bold text-white/5 leading-none mb-4">
                  {step.n}
                </span>
                <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* What you get */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-4">Platform</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5">
              Everything you need
            </h2>
            <p className="text-zinc-400 leading-relaxed text-sm">
              VaultX is built around one goal: grow your crypto safely while giving you complete visibility into every dollar at all times.
            </p>
          </motion.div>

          <motion.ul
            className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 pt-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-zinc-400">
                <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" />
                {b}
              </li>
            ))}
          </motion.ul>
        </div>

      </div>
    </section>
  );
}
