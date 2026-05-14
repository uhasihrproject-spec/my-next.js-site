"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, TrendingUp, Lock } from "lucide-react";

const circles = [
  { color: "bg-blue-600/25", size: "w-80 h-80", x: -300, y: -120 },
  { color: "bg-purple-600/20", size: "w-64 h-64", x: 280, y: -180 },
  { color: "bg-blue-500/15", size: "w-96 h-96", x: -200, y: 200 },
  { color: "bg-indigo-500/20", size: "w-48 h-48", x: 320, y: 160 },
];

const stats = [
  { label: "Supported Coins", value: "6+" },
  { label: "Avg. Annual Returns", value: "Up to 15%" },
  { label: "Withdrawal Processing", value: "24–48h" },
];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050510] text-center px-4">
      {/* Animated background circles */}
      {circles.map((circle, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-3xl ${circle.color} ${circle.size}`}
          initial={{ x: circle.x, y: circle.y }}
          animate={{
            x: [circle.x, circle.x * -0.4, circle.x],
            y: [circle.y, circle.y * -0.4, circle.y],
          }}
          transition={{
            duration: 18 + index * 5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/0 via-[#050510]/20 to-[#050510]" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-sm font-medium mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Professional Crypto Asset Management
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Grow Your Crypto
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            While You Sleep
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Deposit Bitcoin, Ethereum, or USDT. Our expert trading team grows your portfolio and credits earnings directly to your account. Withdraw when your lock-up period ends.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-500/25 hover:from-blue-500 hover:to-purple-500 transition-all hover:scale-105"
          >
            Start Earning
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/features"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur hover:bg-white/10 transition-all"
          >
            How It Works
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-green-400" />
            Secured Deposits
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-400" />
            Controlled Withdrawals
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Expert Trading
          </span>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-14 flex flex-wrap justify-center gap-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
