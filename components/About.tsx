"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    desc: "Sign up in under 2 minutes. No verification delays.",
  },
  {
    number: "02",
    title: "Deposit Crypto",
    desc: "Send any supported coin to our wallet address and submit your transaction hash.",
  },
  {
    number: "03",
    title: "We Trade & Grow",
    desc: "Our expert trading team puts your funds to work, targeting consistent returns.",
  },
  {
    number: "04",
    title: "Withdraw Your Profits",
    desc: "Once your lock-up period ends, withdraw your principal and earnings at any time.",
  },
];

const points = [
  "Professional trading team with proven track record",
  "Real-time balance and earnings dashboard",
  "Transparent transaction history",
  "Admin-controlled withdrawal timing for your protection",
];

export default function About() {
  return (
    <section className="relative py-24 bg-[#050510] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />

      <div className="max-w-6xl mx-auto px-6">
        {/* How it works */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            How{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VaultX Works
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-24">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="relative text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[60%] w-full h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
              )}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-xs font-bold text-blue-400">{step.number}</span>
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{step.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Why choose us */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-5">
              Why VaultX
            </span>
            <h2 className="text-4xl font-extrabold text-white mb-5">
              A Platform Built for{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Serious Investors
              </span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              We combine professional trading expertise with a transparent, user-friendly platform. Every deposit is tracked, every earning is visible, and every withdrawal is processed with care.
            </p>
            <ul className="space-y-3 mb-8">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{point}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20"
            >
              Open Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: "Coins Supported", value: "6", sub: "BTC, ETH, USDT, BNB, SOL, USDC" },
              { label: "Max Annual APY", value: "15%", sub: "Premium tier investors" },
              { label: "Withdrawal Time", value: "24–48h", sub: "After lock-up period" },
              { label: "Minimum Deposit", value: "Any", sub: "No minimum requirement" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/4 border border-white/8 rounded-2xl p-5">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm font-medium text-gray-300 mt-1">{stat.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
