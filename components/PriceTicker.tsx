"use client";

import { useEffect, useState } from "react";

const COINS = [
  { id: "bitcoin",     symbol: "BTC",  color: "#f7931a" },
  { id: "ethereum",    symbol: "ETH",  color: "#627eea" },
  { id: "tether",      symbol: "USDT", color: "#26a17b" },
  { id: "binancecoin", symbol: "BNB",  color: "#f0b90b" },
  { id: "solana",      symbol: "SOL",  color: "#9945ff" },
  { id: "usd-coin",    symbol: "USDC", color: "#2775ca" },
];

interface P { symbol: string; price: number; change: number; color: string }

const FB: P[] = [
  { symbol: "BTC",  price: 67420, change:  2.14, color: "#f7931a" },
  { symbol: "ETH",  price:  3580, change:  1.87, color: "#627eea" },
  { symbol: "USDT", price:  1.00, change:  0.01, color: "#26a17b" },
  { symbol: "BNB",  price:   582, change: -0.43, color: "#f0b90b" },
  { symbol: "SOL",  price:   178, change:  3.21, color: "#9945ff" },
  { symbol: "USDC", price:  1.00, change:  0.00, color: "#2775ca" },
];

function fmt(p: number) {
  if (p >= 10000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1)     return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${p.toFixed(4)}`;
}

export default function PriceTicker() {
  const [prices, setPrices] = useState<P[]>(FB);

  useEffect(() => {
    const ids = COINS.map((c) => c.id).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`)
      .then((r) => r.json())
      .then((data) => {
        const updated = COINS.map((c) => ({
          symbol: c.symbol, color: c.color,
          price:  data[c.id]?.usd ?? 0,
          change: data[c.id]?.usd_24h_change ?? 0,
        })).filter((p) => p.price > 0);
        if (updated.length) setPrices(updated);
      })
      .catch(() => {});
  }, []);

  const items = [...prices, ...prices, ...prices];

  return (
    <div className="bg-[#111113] border-y border-white/[0.05] overflow-hidden select-none">
      <div className="animate-ticker">
        {items.map((p, i) => (
          <div key={i} className="flex items-center gap-3 px-8 py-2.5 shrink-0 border-r border-white/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[11px] font-normal text-zinc-400 tracking-wide">{p.symbol}</span>
            <span className="text-[11px] font-light text-zinc-500">{fmt(p.price)}</span>
            <span className={`text-[10px] font-light tabular-nums ${p.change >= 0 ? "text-emerald-500" : "text-red-400"}`}>
              {p.change >= 0 ? "+" : ""}{p.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
