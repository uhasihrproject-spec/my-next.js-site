"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    min: "Any amount",
    apy: "Up to 8%",
    features: [
      "All supported coins",
      "30-day lock-up period",
      "Dashboard access",
      "Deposit & withdrawal",
      "24–48h withdrawal processing",
    ],
    cta: "Get Started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Growth",
    min: "$1,000+ equivalent",
    apy: "Up to 12%",
    features: [
      "Everything in Starter",
      "Priority deposit confirmation",
      "Dedicated account manager",
      "Flexible lock-up options",
      "Monthly earnings reports",
    ],
    cta: "Start Growing",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Premium",
    min: "$10,000+ equivalent",
    apy: "Up to 15%",
    features: [
      "Everything in Growth",
      "Custom lock-up terms",
      "Priority withdrawals",
      "Direct admin contact",
      "Quarterly strategy reviews",
    ],
    cta: "Contact Us",
    href: "/signup",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section className="py-24 bg-[#050510] text-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.span
          className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Investment Tiers
        </motion.span>
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Choose Your{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Investment Tier
          </span>
        </motion.h2>
        <motion.p
          className="text-gray-400 max-w-xl mx-auto mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          Higher deposits unlock better terms and more personalized service.
        </motion.p>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`relative rounded-2xl p-7 text-left transition-all duration-300 hover:scale-[1.02] ${
                plan.highlight
                  ? "bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-2 border-blue-500/50 shadow-xl shadow-blue-500/10"
                  : "bg-white/4 border border-white/10"
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="mt-3 mb-1">
                <span className="text-3xl font-extrabold text-white">{plan.apy}</span>
                <span className="text-gray-400 text-sm ml-1">APY</span>
              </div>
              <p className="text-sm text-gray-500 mb-5">Minimum: {plan.min}</p>
              <ul className="space-y-2.5 mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20"
                    : "bg-white/8 text-white hover:bg-white/15 border border-white/10"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
