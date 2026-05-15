"use client";

import { motion } from "framer-motion";

const REVIEWS = [
  {
    quote: "My first payout arrived on time. Clean dashboard, no surprises.",
    name: "Marcus T.",
    location: "Lagos, NG",
    initial: "M",
    color: "#3b82f6",
    months: "8 mo",
  },
  {
    quote: "I asked hard questions before depositing. Got honest answers in an hour.",
    name: "Elena K.",
    location: "Kyiv, UA",
    initial: "E",
    color: "#9945ff",
    months: "5 mo",
  },
  {
    quote: "Two withdrawals processed, both on time. The numbers add up.",
    name: "Kwame A.",
    location: "Accra, GH",
    initial: "K",
    color: "#f7931a",
    months: "6 mo",
  },
  {
    quote: "Real-time tracking is what separates VaultX from anything else I've tried.",
    name: "Priya N.",
    location: "Mumbai, IN",
    initial: "P",
    color: "#26a17b",
    months: "4 mo",
  },
  {
    quote: "Started with USDT. Now I deposit BTC every month. Consistent returns.",
    name: "David S.",
    location: "Toronto, CA",
    initial: "D",
    color: "#627eea",
    months: "9 mo",
  },
  {
    quote: "The admin chat resolved my issue in minutes. That kind of support is rare.",
    name: "Aiko T.",
    location: "Tokyo, JP",
    initial: "A",
    color: "#f0b90b",
    months: "3 mo",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="w-3 h-3 text-amber-400/80" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function Card({ r }: { r: typeof REVIEWS[0] }) {
  return (
    <div className="w-[300px] shrink-0 bg-[#1a1a1e] border border-white/[0.06] rounded-2xl p-6 mx-2">
      <Stars />
      <p className="text-[13px] font-light text-zinc-400 leading-relaxed mb-6 min-h-[60px]">
        &ldquo;{r.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-normal text-black shrink-0"
          style={{ backgroundColor: r.color }}>
          {r.initial}
        </div>
        <div>
          <p className="text-[12px] font-normal text-zinc-300">{r.name}</p>
          <p className="text-[10px] font-light text-zinc-600">{r.location} · {r.months}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const doubled = [...REVIEWS, ...REVIEWS];

  return (
    <section className="bg-[#161618] py-28 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[11px] font-light tracking-widest text-zinc-600 uppercase mb-3">Reviews</p>
          <h2 className="text-[clamp(32px,5vw,58px)] font-light text-white tracking-tight leading-[1.1]">
            Investors trust VaultX.
          </h2>
        </motion.div>
      </div>

      {/* Auto-scroll carousel — no drag, no overflow scroll */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#161618] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#161618] to-transparent z-10" />

        <div className="overflow-hidden">
          <div className="animate-carousel py-3">
            {doubled.map((r, i) => (
              <Card key={i} r={r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
