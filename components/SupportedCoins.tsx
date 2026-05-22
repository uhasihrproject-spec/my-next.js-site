"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ArrowUpRight, ArrowUp, ArrowDown } from "lucide-react";
import { useAuthUser } from "./useAuthUser";

type Coin = { id: string; symbol: string; name: string; color: string };

const COINS: Coin[] = [
  { id: "bitcoin",        symbol: "BTC",   name: "Bitcoin",      color: "#f7931a" },
  { id: "ethereum",       symbol: "ETH",   name: "Ethereum",     color: "#627eea" },
  { id: "tether",         symbol: "USDT",  name: "Tether",       color: "#26a17b" },
  { id: "binancecoin",    symbol: "BNB",   name: "BNB",          color: "#f0b90b" },
  { id: "solana",         symbol: "SOL",   name: "Solana",       color: "#9945ff" },
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

const FB: Record<string, { price: number; change: number }> = {
  bitcoin:         { price: 67420,    change:  2.14 },
  ethereum:        { price:  3580,    change:  1.87 },
  tether:          { price:  1.00,    change:  0.01 },
  binancecoin:     { price:   582,    change: -0.43 },
  solana:          { price:   178,    change:  3.21 },
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

function AssetRow({ coin, price, change, i }: {
  coin: Coin; price: number; change: number; i: number;
}) {
  const up = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: Math.min(i * 0.022, 0.4), duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex items-center gap-3.5 py-3.5 px-1 border-b border-[var(--line-soft)] last:border-b-0 cursor-default"
    >
      {/* coin-tinted hover wash */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -mx-2"
           style={{ background: `linear-gradient(90deg, ${coin.color}10, transparent 50%)` }} />

      {/* Coin glyph */}
      <div className="relative shrink-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold tracking-wide ${coin.symbol.length > 3 ? "text-[9px]" : "text-[10.5px]"}`}
             style={{
               background: `linear-gradient(135deg, ${coin.color}, ${coin.color}cc)`,
               color: "#fff",
               boxShadow: `0 4px 14px -4px ${coin.color}80`,
             }}>
          {coin.symbol}
        </div>
      </div>

      {/* Name + ticker */}
      <div className="flex-1 min-w-0 relative">
        <p className="text-[13.5px] font-normal text-[var(--fg-1)] truncate">{coin.name}</p>
        <p className="text-[10.5px] font-light text-[var(--fg-4)] tracking-wide mt-0.5">{coin.symbol}</p>
      </div>

      {/* Price */}
      <div className="text-right shrink-0 min-w-[90px] relative">
        <p className="text-[13px] font-light text-[var(--fg-1)] tabular-nums">{fmt(price)}</p>
        <div className="flex items-center justify-end gap-1 mt-0.5">
          {up ? (
            <ArrowUp className="w-2.5 h-2.5 text-emerald-400" />
          ) : (
            <ArrowDown className="w-2.5 h-2.5 text-red-400" />
          )}
          <span className={`text-[10.5px] font-light tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
            {Math.abs(change).toFixed(2)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function SupportedCoins() {
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>(FB);
  const { user, loaded } = useAuthUser();
  const signedIn = loaded && !!user;
  const ctaHref = signedIn ? (user!.role === "admin" ? "/admin" : "/dashboard#deposit") : "/signup";
  const ctaLabel = signedIn ? "Open dashboard" : "Start depositing";

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

  // Split into two columns of 10 for a clean editorial layout on desktop
  const left = COINS.slice(0, 10);
  const right = COINS.slice(10);

  return (
    <section className="relative bg-[var(--surface-0)] py-28 px-6 overflow-hidden" id="assets">
      {/* faint backdrop glow */}
      <div className="pointer-events-none absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full bg-blue-600/[0.045] blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 -right-40 w-[420px] h-[420px] rounded-full bg-purple-600/[0.04] blur-[140px]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Heading row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-[11px] font-light tracking-[0.22em] text-blue-400/70 uppercase mb-4">Supported assets</p>
            <h2 className="text-[clamp(34px,5vw,58px)] font-light text-[var(--fg-1)] tracking-tight leading-[1.04]">
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
            className="flex flex-col gap-3 shrink-0"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/[0.07] border border-emerald-400/15 w-fit">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-normal text-emerald-300/90 tracking-wide">98% cold storage</span>
            </div>
            <Link href={ctaHref} className="text-[12.5px] font-light text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5">
              {ctaLabel} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Asset table — two columns on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-[var(--line-1)] bg-[var(--surface-1)] overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {/* Table header */}
          <div className="grid grid-cols-1 md:grid-cols-2 px-6 py-3 border-b border-[var(--line-1)] bg-[color-mix(in_srgb,var(--surface-0)_60%,transparent)]">
            <div className="flex items-center justify-between text-[10px] font-normal tracking-[0.18em] text-[var(--fg-5)] uppercase">
              <span>Asset</span>
              <span>Price · 24h</span>
            </div>
            <div className="hidden md:flex items-center justify-between text-[10px] font-normal tracking-[0.18em] text-[var(--fg-5)] uppercase pl-8 ml-8 border-l border-[var(--line-1)]">
              <span>Asset</span>
              <span>Price · 24h</span>
            </div>
          </div>

          {/* Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 px-6">
            <div>
              {left.map((c, i) => {
                const p = prices[c.id] ?? { price: 0, change: 0 };
                return <AssetRow key={c.id} coin={c} price={p.price} change={p.change} i={i} />;
              })}
            </div>
            <div className="md:pl-8 md:ml-8 md:border-l border-[var(--line-1)]">
              {right.map((c, i) => {
                const p = prices[c.id] ?? { price: 0, change: 0 };
                return <AssetRow key={c.id} coin={c} price={p.price} change={p.change} i={i + 10} />;
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-[var(--line-1)] flex items-center justify-between bg-[color-mix(in_srgb,var(--surface-0)_60%,transparent)]">
            <p className="text-[10.5px] font-light text-[var(--fg-4)] tracking-wide">
              20 assets · live via CoinGecko
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10.5px] font-light text-[var(--fg-4)]">Live</span>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-[11px] font-light text-[var(--fg-5)] text-center mt-10"
        >
          More assets added regularly.
        </motion.p>
      </div>
    </section>
  );
}
