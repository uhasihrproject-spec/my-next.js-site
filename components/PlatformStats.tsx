"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const STATS = [
  { value: 47,   prefix: "$", suffix: "M+", label: "Assets managed" },
  { value: 2400, suffix: "+",               label: "Investors" },
  { value: 18,   suffix: "%",               label: "Max APY" },
  { value: 40,   suffix: "+",               label: "Countries" },
];

function Counter({ value, prefix = "", suffix = "", started, done }: {
  value: number; prefix?: string; suffix?: string; started: boolean; done: () => void;
}) {
  const [n, setN] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started) return;
    const dur = 2200;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setN(Math.round(e * value));
      if (p < 1) { raf = requestAnimationFrame(tick); }
      else { setN(value); setFinished(true); done(); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  return (
    <span className={finished ? "animate-glow" : ""}>
      {prefix}{n >= 1000 ? n.toLocaleString() : n}{suffix}
    </span>
  );
}

export default function PlatformStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bg-[#161618] py-28 px-6 overflow-hidden" id="features">
      <div className="max-w-5xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-[11px] font-light tracking-widest text-zinc-600 uppercase mb-16"
        >
          By the numbers
        </motion.p>

        <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-[#161618] hover:bg-[#1a1a1e] transition-colors py-12 px-8 flex flex-col items-start"
            >
              <p className="text-[clamp(34px,4vw,52px)] font-light text-white tabular-nums leading-none mb-2">
                <Counter {...s} started={started} done={() => {}} />
              </p>
              <p className="text-[12px] font-light text-zinc-600">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
