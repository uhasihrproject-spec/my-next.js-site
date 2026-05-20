"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const FAQS = [
  { q: "How does VaultX work?",         a: "Deposit crypto to our wallet, submit your transaction hash, and our trading team manages your funds. Earnings are credited daily. Withdraw anytime after your lock-up ends." },
  { q: "Which coins can I deposit?",    a: "Twenty assets including BTC, ETH, USDT, BNB, SOL, USDC, XRP, ADA, DOGE, TRX, AVAX, DOT, LINK, MATIC, LTC, BCH, SHIB, AAVE, UNI and XMR. Wallet addresses are shown in your dashboard after signup." },
  { q: "How long is the lock-up?",      a: "Default is 30 days from your first confirmed deposit. Growth and Premium tiers offer flexible options. Admins can set custom periods per account." },
  { q: "How do I withdraw?",            a: "Go to the Withdraw tab on your dashboard, enter the amount and your wallet address, and submit. Processed within 24–48 hours." },
  { q: "How are earnings calculated?",  a: "Our trading team credits earnings directly to your account. You can see principal and earned interest as separate line items at all times." },
  { q: "What is a withdrawal lock?",    a: "Admins can temporarily pause withdrawals platform-wide or per account. You'll always see the reason and expected timeline on your dashboard." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-[#161618] py-28 px-6" id="faq">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <p className="text-[11px] font-light tracking-widest text-zinc-600 uppercase mb-3">FAQ</p>
          <h2 className="text-[clamp(30px,4.5vw,52px)] font-light text-white tracking-tight leading-tight">
            Common questions.
          </h2>
        </motion.div>

        <div className="border border-white/[0.05] rounded-2xl overflow-hidden divide-y divide-white/[0.05]">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-[#161618] hover:bg-[#1a1a1e] transition-colors">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
              >
                <span className={`text-[14px] font-light leading-snug transition-colors ${open === i ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`shrink-0 transition-colors ${open === i ? "text-blue-400" : "text-zinc-700"}`}
                >
                  <Plus className="w-4 h-4" />
                </motion.span>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-[13px] font-light text-zinc-500 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
