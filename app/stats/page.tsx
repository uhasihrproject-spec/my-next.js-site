"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  sparkline_in_7d?: { price: number[] };
}

function Sparkline({ prices, positive }: { prices: number[]; positive: boolean }) {
  if (!prices || prices.length < 2) return null;
  const data = prices.slice(-24); // last 24 points
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = data.map((p, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        fill="none"
        stroke={positive ? "#34d399" : "#f87171"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
    </svg>
  );
}

function formatNum(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function formatPrice(p: number): string {
  if (p >= 10000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${p.toFixed(6)}`;
}

export default function StatsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchCoins() {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h"
      );
      if (res.ok) {
        const data = await res.json();
        setCoins(data);
        setLastUpdated(new Date());
      }
    } catch {/* ignore */}
    finally { setLoading(false); }
  }

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 60000);
    return () => clearInterval(interval);
  }, []);

  const gainers = [...coins]
    .filter((c) => c.price_change_percentage_24h > 0)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 5);

  const losers = [...coins]
    .filter((c) => c.price_change_percentage_24h < 0)
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 5);

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="pt-14">
        {/* Header */}
        <div className="max-w-5xl mx-auto px-5 pt-16 pb-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase mb-3">Markets</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Live Crypto Stats
              </h1>
              <p className="mt-2 text-zinc-500 text-sm">
                Top 20 coins by market cap · updated every minute
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-[11px] text-zinc-700">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchCoins}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white border border-white/8 hover:border-white/15 px-3 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Gainers / Losers */}
        <div className="max-w-5xl mx-auto px-5 mb-8 grid sm:grid-cols-2 gap-4">
          {[
            { title: "Top Gainers 24h", items: gainers, positive: true },
            { title: "Top Losers 24h", items: losers, positive: false },
          ].map(({ title, items, positive }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-white/6 rounded-2xl overflow-hidden"
            >
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/6">
                {positive
                  ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                  : <TrendingDown className="w-4 h-4 text-red-400" />
                }
                <p className="text-sm font-semibold text-white">{title}</p>
              </div>
              {loading ? (
                <div className="py-8 text-center text-zinc-700 text-xs">Loading…</div>
              ) : items.map((coin, i) => (
                <div key={coin.id} className="flex items-center gap-3 px-5 py-3 border-b border-white/4 last:border-0">
                  <span className="text-[10px] text-zinc-700 w-4 shrink-0">{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{coin.symbol.toUpperCase()}</p>
                    <p className="text-[10px] text-zinc-600 truncate">{coin.name}</p>
                  </div>
                  <span className={`text-xs font-bold ${positive ? "text-emerald-400" : "text-red-400"}`}>
                    {positive ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
                  </span>
                </div>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Full Table */}
        <div className="max-w-5xl mx-auto px-5 pb-16">
          <div className="bg-[#0a0a0a] border border-white/6 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/6">
              <p className="text-sm font-semibold text-white">Market Overview</p>
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2rem_1fr_7rem_7rem_7rem_7rem_5rem] gap-4 px-6 py-2.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest border-b border-white/5">
              <span>#</span>
              <span>Name</span>
              <span className="text-right">Price</span>
              <span className="text-right">24h %</span>
              <span className="text-right">Market Cap</span>
              <span className="text-right">Volume 24h</span>
              <span className="text-right">7d Chart</span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-zinc-700 text-sm">Fetching market data…</div>
            ) : (
              coins.map((coin, i) => {
                const positive = coin.price_change_percentage_24h >= 0;
                return (
                  <motion.div
                    key={coin.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex flex-col md:grid md:grid-cols-[2rem_1fr_7rem_7rem_7rem_7rem_5rem] gap-2 md:gap-4 px-6 py-4 border-b border-white/4 last:border-0 hover:bg-white/2 transition-colors"
                  >
                    {/* Rank */}
                    <span className="hidden md:block text-[11px] text-zinc-700 self-center">{i + 1}</span>

                    {/* Name */}
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-white">{coin.name}</p>
                        <p className="text-[11px] text-zinc-600 uppercase">{coin.symbol}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex md:block justify-between items-center">
                      <span className="md:hidden text-[11px] text-zinc-600">Price</span>
                      <p className="text-sm text-white font-medium md:text-right">{formatPrice(coin.current_price)}</p>
                    </div>

                    {/* 24h */}
                    <div className="flex md:block justify-between items-center">
                      <span className="md:hidden text-[11px] text-zinc-600">24h</span>
                      <p className={`text-sm font-semibold md:text-right ${positive ? "text-emerald-400" : "text-red-400"}`}>
                        {positive ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
                      </p>
                    </div>

                    {/* Market Cap */}
                    <div className="flex md:block justify-between items-center">
                      <span className="md:hidden text-[11px] text-zinc-600">Mkt Cap</span>
                      <p className="text-[12px] text-zinc-400 md:text-right">{formatNum(coin.market_cap)}</p>
                    </div>

                    {/* Volume */}
                    <div className="flex md:block justify-between items-center">
                      <span className="md:hidden text-[11px] text-zinc-600">Volume</span>
                      <p className="text-[12px] text-zinc-400 md:text-right">{formatNum(coin.total_volume)}</p>
                    </div>

                    {/* Sparkline */}
                    <div className="flex justify-end items-center">
                      <Sparkline prices={coin.sparkline_in_7d?.price || []} positive={positive} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <p className="mt-4 text-[11px] text-zinc-800 text-center">
            Data provided by CoinGecko API · For informational purposes only
          </p>
        </div>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}
