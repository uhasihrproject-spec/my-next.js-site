"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ArrowUpRight } from "lucide-react";
import { useTheme } from "./ThemeProvider";

type Coin = { id: string; symbol: string; name: string; color: string };

const FEATURED: Coin[] = [
  { id: "bitcoin",     symbol: "BTC", name: "Bitcoin",   color: "#f7931a" },
  { id: "ethereum",    symbol: "ETH", name: "Ethereum",  color: "#627eea" },
  { id: "solana",      symbol: "SOL", name: "Solana",    color: "#9945ff" },
  { id: "binancecoin", symbol: "BNB", name: "BNB",       color: "#f0b90b" },
];

const REST: Coin[] = [
  { id: "tether",         symbol: "USDT",  name: "Tether",       color: "#26a17b" },
  { id: "usd-coin",       symbol: "USDC",  name: "USD Coin",     color: "#2775ca" },
  { id: "ripple",         symbol: "XRP",   name: "XRP",          color: "#00aae4" },
  { id: "cardano",        symbol: "ADA",   name: "Cardano",      color: "#0033ad" },
  { id: "dogecoin",       symbol: "DOGE",  name: "Dogecoin",     color: "#c2a633" },
  { id: "tron",           symbol: "TRX",   name: "TRON",         color: "#ff060a" },
  { id: "avalanche-2",    symbol: "AVAX",  name: "Avalanche",    color: "#e84142" },
  { id: "polkadot",       symbol: "DOT",   name: "Polkadot",     color: "#e6007a" },
  { id: "chainlink",      symbol: "LINK",  name: "Chainlink",    color: "#2a5ada" },
  { id: "matic-network",  symbol: "MATIC", name: "Polygon",      color: "#8247e5" },
  { id: "litecoin",       symbol: "LTC",   name: "Litecoin",     color: "#345d9d" },
  { id: "bitcoin-cash",   symbol: "BCH",   name: "Bitcoin Cash", color: "#8dc351" },
  { id: "shiba-inu",      symbol: "SHIB",  name: "Shiba Inu",    color: "#ffa409" },
  { id: "aave",           symbol: "AAVE",  name: "Aave",         color: "#b6509e" },
  { id: "uniswap",        symbol: "UNI",   name: "Uniswap",      color: "#ff007a" },
  { id: "monero",         symbol: "XMR",   name: "Monero",       color: "#ff6600" },
];

const ALL = [...FEATURED, ...REST];

const FB: Record<string, { price: number; change: number }> = {
  bitcoin:         { price: 67420,    change:  2.14 },
  ethereum:        { price:  3580,    change:  1.87 },
  solana:          { price:   178,    change:  3.21 },
  binancecoin:     { price:   582,    change: -0.43 },
  tether:          { price:  1.00,    change:  0.01 },
  "usd-coin":      { price:  1.00,    change:  0.00 },
  ripple:          { price:  0.58,    change:  1.12 },
  cardano:         { price:  0.46,    change: -0.91 },
  dogecoin:        { price:  0.16,    change:  2.40 },
  tron:            { price:  0.13,    change:  0.55 },
  "avalanche-2":   { price: 36.50,    change:  1.45 },
  polkadot:        { price:  7.20,    change: -0.60 },
  chainlink:       { price: 16.40,    change:  2.05 },
  "matic-network": { price:  0.72,    change: -1.10 },
  litecoin:        { price: 84.00,    change:  0.85 },
  "bitcoin-cash":  { price: 420.00,   change:  1.20 },
  "shiba-inu":     { price: 0.000025, change:  3.80 },
  aave:            { price: 102.00,   change: -0.75 },
  uniswap:         { price:  9.50,    change:  1.65 },
  monero:          { price: 168.00,   change:  0.40 },
};

function fmt(p: number) {
  if (p >= 10000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1)     return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 0.01)  return `$${p.toFixed(4)}`;
  return `$${p.toFixed(8).replace(/0+$/, "0")}`;
}

export default function SupportedCoins() {
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>(FB);
  const { resolved } = useTheme();
  // In light mode the coin chip backgrounds need more saturation to read.
  const chipBg = (c: string) => (resolved === "light" ? c + "22" : c + "1a");
  const chipBgStrong = (c: string) => (resolved === "light" ? c + "33" : c + "22");

  useEffect(() => {
    const ids = ALL.map((c) => c.id).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`)
      .then((r) => r.json())
      .then((data) => {
        const u: typeof FB = {};
        ALL.forEach((c) => {
          if (data[c.id]?.usd) u[c.id] = { price: data[c.id].usd, change: data[c.id].usd_24h_change ?? 0 };
        });
        if (Object.keys(u).length) setPrices((p) => ({ ...p, ...u }));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative bg-[var(--surface-0)] py-28 px-6 overflow-hidden" id="assets">
      {/* faint backdrop glow */}
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full bg-blue-600/[0.045] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 -right-40 w-[420px] h-[420px] rounded-full bg-purple-600/[0.04] blur-[140px]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Heading row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[11px] font-light tracking-widest text-blue-400/60 uppercase mb-3">Supported assets</p>
            <h2 className="text-[clamp(32px,5vw,58px)] font-light text-[var(--fg-1)] tracking-tight leading-[1.05]">
              Twenty coins.<br />
              <span className="text-blue-400">One quiet vault.</span>
            </h2>
            <p className="text-[13.5px] font-light text-[var(--fg-3)] mt-5 max-w-md leading-relaxed">
              Deposit any major asset — earnings start the moment your transaction confirms.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-2 shrink-0"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/[0.07] border border-emerald-400/15 w-fit">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-normal text-emerald-300/90 tracking-wide">98% cold storage</span>
            </div>
            <Link href="/signup" className="text-[13px] font-light text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5">
              Start depositing <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Featured 4 — big cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {FEATURED.map((coin, i) => {
            const p = prices[coin.id] ?? { price: 0, change: 0 };
            const up = p.change >= 0;
            return (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.06, duration: 0.55 }}
                whileHover={{ y: -4, transition: { duration: 0.18 } }}
                className="group relative bg-[var(--surface-1)] border border-[var(--line-1)] rounded-2xl p-5 overflow-hidden cursor-default"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* coin-coloured accent bar */}
                <div className="absolute inset-x-0 top-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity"
                     style={{ background: `linear-gradient(90deg, transparent, ${coin.color}, transparent)` }} />
                {/* hover glow */}
                <div className="pointer-events-none absolute -top-16 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     style={{ background: `radial-gradient(circle, ${coin.color}26 0%, transparent 70%)` }} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-semibold tracking-wide border"
                         style={{ backgroundColor: chipBgStrong(coin.color), color: coin.color, borderColor: coin.color + "33" }}>
                      {coin.symbol}
                    </div>
                    <span className={`text-[10.5px] font-light tabular-nums px-2 py-0.5 rounded-md ${up ? "text-emerald-400 bg-emerald-400/[0.07]" : "text-red-400 bg-red-400/[0.07]"}`}>
                      {up ? "▲" : "▼"} {Math.abs(p.change).toFixed(2)}%
                    </span>
                  </div>

                  <p className="text-[12px] font-light text-[var(--fg-4)] mb-1">{coin.name}</p>
                  <p className="text-[22px] font-light text-[var(--fg-1)] tabular-nums tracking-tight">{fmt(p.price)}</p>

                  <div className="mt-5 h-[2px] bg-[var(--line-1)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.min(Math.abs(p.change) * 12, 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, delay: i * 0.06 + 0.25 }}
                      className="h-full rounded-full" style={{ backgroundColor: coin.color }} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Divider label */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-3 mt-10 mb-5"
        >
          <span className="text-[10.5px] font-light tracking-[0.2em] text-[var(--fg-5)] uppercase">+ 16 more assets</span>
          <span className="flex-1 h-px bg-[var(--line-1)]" />
        </motion.div>

        {/* The rest — clean compact pills */}
        <div className="flex flex-wrap gap-2">
          {REST.map((coin, i) => {
            const p = prices[coin.id] ?? { price: 0, change: 0 };
            const up = p.change >= 0;
            return (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(i * 0.02, 0.4), duration: 0.4 }}
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className="group flex items-center gap-2.5 bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--line-1)] hover:border-[var(--line-2)] rounded-full pl-2 pr-3.5 py-1.5 transition-colors cursor-default"
                title={coin.name}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[8.5px] font-semibold tracking-wide shrink-0"
                      style={{ backgroundColor: chipBg(coin.color), color: coin.color }}>
                  {coin.symbol.length > 4 ? coin.symbol.slice(0, 3) : coin.symbol}
                </span>
                <span className="text-[11.5px] font-normal text-[var(--fg-2)] tracking-wide">{coin.symbol}</span>
                <span className="text-[10.5px] font-light text-[var(--fg-4)] tabular-nums">{fmt(p.price)}</span>
                <span className={`text-[9.5px] font-light tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
                  {up ? "+" : ""}{p.change.toFixed(1)}%
                </span>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-[11px] font-light text-[var(--fg-5)] text-center mt-14"
        >
          Live prices via CoinGecko · more assets added regularly.
        </motion.p>
      </div>
    </section>
  );
}
