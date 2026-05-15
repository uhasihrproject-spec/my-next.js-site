"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    <section className="relative bg-[#0e101a] py-40 px-6 overflow-hidden">
      {/* Ambient */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-700/[0.12] rounded-full blur-[160px]"
      />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[11px] font-light tracking-widest text-blue-400/50 uppercase mb-8"
        >
          Start today
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(44px,8vw,100px)] font-light text-white tracking-tight leading-[1.0] mb-8"
        >
          Your crypto<br />
          <span className="text-blue-400">shouldn&apos;t idle.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="text-[14px] font-light text-zinc-500 mb-10"
        >
          Deposit. Earn. Withdraw.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/signup"
            className="px-8 py-3.5 bg-white hover:bg-zinc-100 text-black text-[13px] font-normal rounded-xl transition-colors">
            Open free account
          </Link>
          <Link href="/#faq"
            className="px-8 py-3.5 border border-white/[0.08] hover:border-white/[0.14] text-zinc-500 hover:text-zinc-300 text-[13px] font-light rounded-xl transition-all">
            Read FAQ
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
