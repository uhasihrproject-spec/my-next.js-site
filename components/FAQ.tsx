"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


const faqs = [
  {
    question: "How does VaultX work?",
    answer:
      "You deposit your crypto to our designated wallet address, and our expert trading team allocates it across proven strategies to generate consistent returns. Your earnings are credited to your account and available at the end of your lock-up period.",
  },
  {
    question: "What coins can I deposit?",
    answer:
      "We currently support Bitcoin (BTC), Ethereum (ETH), Tether (USDT), BNB, Solana (SOL), and USD Coin (USDC). We're actively expanding our supported asset list.",
  },
  {
    question: "How long is my funds locked?",
    answer:
      "The default lock-up period is 30 days from your first confirmed deposit. This allows our trading strategies time to compound your returns. The administrator may also set custom lock periods per account.",
  },
  {
    question: "How do I initiate a withdrawal?",
    answer:
      "Once your lock-up period has ended, go to the Withdraw section of your dashboard. Enter the amount and your wallet address. Our team processes all withdrawal requests within 24–48 hours.",
  },
  {
    question: "How are earnings calculated?",
    answer:
      "Earnings are calculated by our trading team based on portfolio performance and credited directly to your account balance. You can track your principal and earnings separately in your dashboard.",
  },
  {
    question: "Is my investment secure?",
    answer:
      "All deposits are held securely by the platform. Our trading strategies are managed by experienced professionals focused on capital preservation and growth. We use industry-standard security practices to protect your account.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-5xl font-extrabold text-center mb-16">
          Frequently Asked Questions
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="bg-gray-800/40 backdrop-blur-xl rounded-3xl p-6 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              onClick={() => toggle(i)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-blue-400 text-xl mr-2">💬</span>
                <h3 className="text-lg md:text-xl font-semibold text-white">
                  {faq.question}
                </h3>
              </div>

              <AnimatePresence>
                {activeIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-4 text-gray-300 text-base md:text-lg"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
