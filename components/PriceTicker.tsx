"use client";

import { useEffect, useState } from "react";

const COINS = [
  { id: "bitcoin",       symbol: "BTC",   color: "#f7931a" },
  { id: "ethereum",      symbol: "ETH",   color: "#627eea" },
  { id: "tether",        symbol: "USDT",  color: "#26a17b" },
  { id: "binancecoin",   symbol: "BNB",   color: "#f0b90b" },
  { id: "solana",        symbol: "SOL",   color: "#9945ff" },
  { id: "usd-coin",      symbol: "USDC",  color: "#2775ca" },
  { id: "ripple",        symbol: "XRP",   color: "#00aae4" },
  { id: "cardano",       symbol: "ADA",   color: "#0033ad" },
  { id: "dogecoin",      symbol: "DOGE",  color: "#c2a633" },
  { id: "tron",          symbol: "TRX",   color: "#ff060a" },
  { id: "avalanche-2",   symbol: "AVAX",  color: "#e84142" },
  { id: "polkadot",      symbol: "DOT",   color: "#e6007a" },
  { id: "chainlink",     symbol: "LINK",  color: "#2a5ada" },
  { id: "matic-network", symbol: "MATIC", color: "#8247e5" },
  { id: "litecoin",      symbol: "LTC",   color: "#345d9d" },
  { id: "bitcoin-cash",  symbol: "BCH",   color: "#8dc351" },
  { id: "shiba-inu",     symbol: "SHIB",  color: "#ffa409" },
  { id: "aave",          symbol: "AAVE",  color: "#b6509e" },
  { id: "uniswap",       symbol: "UNI",   color: "#ff007a" },
  { id: "monero",        symbol: "XMR",   color: "#ff6600" },
];

interface P { symbol: string; price: number; change: number; color: string }

const FB: P[] = [
  { symbol: "BTC",   price: 67420,    change:  2.14, color: "#f7931a" },
  { symbol: "ETH",   price:  3580,    change:  1.87, color: "#627eea" },
  { symbol: "USDT",  price:  1.00,    change:  0.01, color: "#26a17b" },
  { symbol: "BNB",   price:   582,    change: -0.43, color: "#f0b90b" },
  { symbol: "SOL",   price:   178,    change:  3.21, color: "#9945ff" },
  { symbol: "USDC",  price:  1.00,    change:  0.00, color: "#2775ca" },
  { symbol: "XRP",   price:  0.58,    change:  1.12, color: "#00aae4" },
  { symbol: "ADA",   price:  0.46,    change: -0.91, color: "#0033ad" },
  { symbol: "DOGE",  price:  0.16,    change:  2.40, color: "#c2a633" },
  { symbol: "TRX",   price:  0.13,    change:  0.55, color: "#ff060a" },
  { symbol: "AVAX",  price: 36.50,    change:  1.45, color: "#e84142" },
  { symbol: "DOT",   price:  7.20,    change: -0.60, color: "#e6007a" },
  { symbol: "LINK",  price: 16.40,    change:  2.05, color: "#2a5ada" },
  { symbol: "MATIC", price:  0.72,    change: -1.10, color: "#8247e5" },
  { symbol: "LTC",   price: 84.00,    change:  0.85, color: "#345d9d" },
  { symbol: "BCH",   price: 420.00,   change:  1.20, color: "#8dc351" },
  { symbol: "SHIB",  price: 0.000025, change:  3.80, color: "#ffa409" },
  { symbol: "AAVE",  price: 102.00,   change: -0.75, color: "#b6509e" },
  { symbol: "UNI",   price:  9.50,    change:  1.65, color: "#ff007a" },
  { symbol: "XMR",   price: 168.00,   change:  0.40, color: "#ff6600" },
];

function fmt(p: number) {
  if (p >= 10000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1)     return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 0.01)  return `$${p.toFixed(4)}`;
  return `$${p.toFixed(8).replace(/0+$/, "0")}`;
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
