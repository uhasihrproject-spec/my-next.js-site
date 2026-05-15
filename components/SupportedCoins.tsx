"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const COINS = [
  { id: "bitcoin",     symbol: "BTC",  name: "Bitcoin",   color: "#f7931a", min: "0.001 BTC" },
  { id: "ethereum",    symbol: "ETH",  name: "Ethereum",  color: "#627eea", min: "0.01 ETH" },
  { id: "tether",      symbol: "USDT", name: "Tether",    color: "#26a17b", min: "50 USDT" },
  { id: "binancecoin", symbol: "BNB",  name: "BNB",       color: "#f0b90b", min: "0.1 BNB" },
  { id: "solana",      symbol: "SOL",  name: "Solana",    color: "#9945ff", min: "1 SOL" },
  { id: "usd-coin",    symbol: "USDC", name: "USD Coin",  color: "#2775ca", min: "50 USDC" },
];

const FB: Record<string, { price: number; change: number }> = {
  bitcoin:     { price: 67420, change:  2.14 },
  ethereum:    { price:  3580, change:  1.87 },
  tether:      { price:  1.00, change:  0.01 },
  binancecoin: { price:   582, change: -0.43 },
  solana:      { price:   178, change:  3.21 },
  "usd-coin":  { price:  1.00, change:  0.00 },
};

function fmt(p: number) {
  if (p >= 10000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1)     return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${p.toFixed(4)}`;
}

export default function SupportedCoins() {
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>(FB);

  useEffect(() => {
    const ids = COINS.map((c) => c.id).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`)
      .then((r) => r.json())
      .then((data) => {
        const u: typeof FB = {};
        COINS.forEach((c) => {
          if (data[c.id]?.usd) u[c.id] = { price: data[c.id].usd, change: data[c.id].usd_24h_change ?? 0 };
        });
        if (Object.keys(u).length) setPrices((p) => ({ ...p, ...u }));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-[#111113] py-28 px-6 overflow-hidden" id="assets">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="text-[11px] font-light tracking-widest text-zinc-600 uppercase mb-3">Assets</p>
            <h2 className="text-[clamp(32px,5vw,58px)] font-light text-white tracking-tight leading-[1.1]">
              Six coins. One vault.
            </h2>
          </motion.div>
          <Link href="/signup" className="text-[13px] font-light text-blue-400 hover:text-blue-300 transition-colors shrink-0">
            Start depositing →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COINS.map((coin, i) => {
            const p = prices[coin.id] ?? { price: 0, change: 0 };
            const up = p.change >= 0;
            return (
              <motion.div key={coin.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="group bg-[#1a1a1e] border border-white/[0.05] hover:border-white/[0.09] rounded-xl p-5 transition-all cursor-default"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[9px] font-normal border border-white/[0.06]"
                      style={{ backgroundColor: coin.color + "15", color: coin.color }}>
                      {coin.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <p className="text-[13px] font-normal text-zinc-300">{coin.name}</p>
                      <p className="text-[10px] font-light text-zinc-600">{coin.symbol}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-light tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
                    {up ? "+" : ""}{p.change.toFixed(2)}%
                  </span>
                </div>

                <p className="text-[20px] font-light text-white mb-3">{fmt(p.price)}</p>

                <div className="h-[2px] bg-white/[0.04] rounded-full overflow-hidden mb-2.5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${Math.min(Math.abs(p.change) * 12, 100)}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.06 + 0.3 }}
                    className="h-full rounded-full" style={{ backgroundColor: coin.color }} />
                </div>
                <p className="text-[10px] font-light text-zinc-700">Min. {coin.min}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
