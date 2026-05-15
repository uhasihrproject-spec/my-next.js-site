"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Eye, UserCheck, Clock, HeadphonesIcon } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Encrypted storage",
    desc: "All balances and personal data are stored with AES-256 encryption. Your information never leaves our secure servers.",
  },
  {
    icon: Lock,
    title: "Multi-layer withdrawal locks",
    desc: "Three independent lock mechanisms protect against unauthorized withdrawals — time-based, per-account, and global.",
  },
  {
    icon: Eye,
    title: "Transparent transaction ledger",
    desc: "Every deposit, earning credit, and withdrawal is permanently logged. You can audit your full history at any time.",
  },
  {
    icon: UserCheck,
    title: "Admin-verified deposits",
    desc: "No deposit is credited until manually verified by our team against your transaction hash on the blockchain.",
  },
  {
    icon: Clock,
    title: "Lock-up period protection",
    desc: "Withdrawal lock periods align with our trading cycles, ensuring we never disrupt active positions.",
  },
  {
    icon: HeadphonesIcon,
    title: "Direct admin support",
    desc: "Chat directly with our team through the built-in support widget. No ticket queues, no bots.",
  },
];

export default function SecuritySection() {
  return (
    <section className="bg-black py-24 px-5 border-t border-white/5 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 items-start">
          {/* Left: sticky headline */}
          <motion.div
            className="md:col-span-2 md:sticky md:top-28"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-4">Security</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              Built for trust,<br />
              <span className="text-blue-500">not just profit</span>
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              We take the security of your assets as seriously as you do. Multiple layers of protection ensure your funds stay safe at every step.
            </p>

            {/* Shield badge */}
            <div className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-600/8 border border-blue-500/15">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Secured Platform</p>
                <p className="text-[11px] text-zinc-600">Enterprise-grade protection</p>
              </div>
            </div>
          </motion.div>

          {/* Right: feature grid */}
          <div className="md:col-span-3 grid sm:grid-cols-2 gap-4">
            {TRUST_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="p-5 bg-[#0a0a0a] border border-white/6 hover:border-white/10 rounded-2xl transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/8 border border-blue-500/15 flex items-center justify-center mb-4 group-hover:bg-blue-500/12 transition-colors">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
