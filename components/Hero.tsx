"use client";

import { motion } from "framer-motion";

const circles = [
  { color: "bg-purple-500/40", size: "w-40 h-40", x: -200, y: -100 },
  { color: "bg-blue-500/30", size: "w-32 h-32", x: 200, y: -150 },
  { color: "bg-pink-500/20", size: "w-56 h-56", x: -250, y: 150 },
  { color: "bg-green-400/30", size: "w-28 h-28", x: 250, y: 180 },
];

export default function Hero() {
  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden bg-gray-950 text-center">
      {/* Animated Circles */}
      {circles.map((circle, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-3xl ${circle.color} ${circle.size}`}
          initial={{ x: circle.x, y: circle.y }}
          animate={{
            x: [circle.x, circle.x * -0.5, circle.x],
            y: [circle.y, circle.y * -0.5, circle.y],
          }}
          transition={{
            duration: 15 + index * 5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Overlay for translucency */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-3xl px-6 text-white">
        <motion.h1
          className="text-5xl font-extrabold sm:text-6xl md:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            CryptoSite
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg sm:text-xl text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          The future of finance starts here — secure, fast, and borderless
          crypto solutions.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <button className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-lg font-semibold shadow-lg transition hover:opacity-90">
            Get Started
          </button>
          <button className="rounded-xl border border-gray-500/40 bg-white/10 px-6 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-white/20">
            Learn More
          </button>
        </motion.div>
      </div>
    </section>
  );
}
