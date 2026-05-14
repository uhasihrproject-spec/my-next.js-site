"use client";

import { motion } from "framer-motion";
import { Shield, TrendingUp, Clock, Wallet, BarChart3, RefreshCw } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Expert Trading",
    desc: "Your funds are managed by experienced traders using proven strategies to maximize returns.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Shield,
    title: "Secured Deposits",
    desc: "All deposited assets are held securely. We use industry-standard protection for every account.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    icon: Wallet,
    title: "Multi-Coin Support",
    desc: "Deposit BTC, ETH, USDT, BNB, SOL, and USDC. Diversify your earnings across multiple assets.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: BarChart3,
    title: "Earnings Tracking",
    desc: "Your dashboard shows principal and earned interest separately, so you always know what you've made.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  {
    icon: Clock,
    title: "Lock-Up Periods",
    desc: "Funds are locked for a set period after deposit — allowing strategies time to fully compound.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: RefreshCw,
    title: "Fast Withdrawals",
    desc: "Once your lock-up period ends, submit a withdrawal request and receive your funds within 24–48 hours.",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/20",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative z-10 bg-[#050510] py-24 px-6 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Why VaultX
          </motion.span>
          <motion.h2
            className="text-4xl font-extrabold sm:text-5xl text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Grow Your Portfolio
            </span>
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            A complete platform for depositing, growing, and managing your cryptocurrency investments.
          </motion.p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat, index) => (
            <motion.div
              key={feat.title}
              className={`rounded-2xl border ${feat.border} ${feat.bg} p-6 backdrop-blur-sm hover:scale-[1.02] transition-all duration-300`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div className={`w-10 h-10 rounded-xl ${feat.bg} border ${feat.border} flex items-center justify-center mb-4`}>
                <feat.icon className={`w-5 h-5 ${feat.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
