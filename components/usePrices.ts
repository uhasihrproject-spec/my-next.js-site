"use client";

import { useEffect, useState } from "react";
// IMPORTANT: only import the *type* — `lib/db` pulls in `fs`/`path` and
// crashes Turbopack's client bundle with "Module not found: Can't resolve 'fs'".
import type { CoinKey } from "@/lib/db";

/** Keep this list in lockstep with SUPPORTED_COINS in lib/db.ts. */
export const SUPPORTED_COINS: CoinKey[] = [
  "BTC", "ETH", "USDT", "BNB", "SOL", "USDC",
  "XRP", "ADA", "DOGE", "TRX", "AVAX", "DOT",
  "LINK", "MATIC", "LTC", "BCH", "SHIB", "AAVE", "UNI", "XMR",
];

/** Map of CoinKey → CoinGecko slug for the live price endpoint. */
export const CG_ID: Record<CoinKey, string> = {
  BTC: "bitcoin",        ETH: "ethereum",       USDT: "tether",
  BNB: "binancecoin",    SOL: "solana",         USDC: "usd-coin",
  XRP: "ripple",         ADA: "cardano",        DOGE: "dogecoin",
  TRX: "tron",           AVAX: "avalanche-2",   DOT: "polkadot",
  LINK: "chainlink",     MATIC: "matic-network", LTC: "litecoin",
  BCH: "bitcoin-cash",   SHIB: "shiba-inu",     AAVE: "aave",
  UNI: "uniswap",        XMR: "monero",
};

/** Fallback USD prices used until CoinGecko responds (or if it fails). */
const FALLBACK: Record<CoinKey, number> = {
  BTC: 67420, ETH: 3580, USDT: 1.00, BNB: 582, SOL: 178, USDC: 1.00,
  XRP: 0.58, ADA: 0.46, DOGE: 0.16, TRX: 0.13, AVAX: 36.5, DOT: 7.20,
  LINK: 16.4, MATIC: 0.72, LTC: 84.0, BCH: 420, SHIB: 0.000025,
  AAVE: 102, UNI: 9.50, XMR: 168,
};

// Module-level cache so multiple components share one in-flight request and
// the same price snapshot for the duration of the tab.
let cache: Record<CoinKey, number> | null = null;
let inflight: Promise<Record<CoinKey, number>> | null = null;
const listeners = new Set<(p: Record<CoinKey, number>) => void>();

function notify(p: Record<CoinKey, number>) {
  cache = p;
  listeners.forEach((fn) => fn(p));
}

async function fetchPrices(): Promise<Record<CoinKey, number>> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const ids = SUPPORTED_COINS.map((c) => CG_ID[c]).join(",");
      const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
      if (!r.ok) throw new Error("price fetch failed");
      const d = await r.json();
      const next: Record<CoinKey, number> = { ...FALLBACK };
      SUPPORTED_COINS.forEach((c) => {
        const v = d[CG_ID[c]]?.usd;
        if (typeof v === "number" && v > 0) next[c] = v;
      });
      notify(next);
      return next;
    } catch {
      notify(FALLBACK);
      return FALLBACK;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/**
 * Shared live USD prices for every supported coin. Refreshes every 60s
 * across all subscribed components via a single fetch.
 */
export function usePrices() {
  const [prices, setPrices] = useState<Record<CoinKey, number>>(cache ?? FALLBACK);

  useEffect(() => {
    const listener = (p: Record<CoinKey, number>) => setPrices(p);
    listeners.add(listener);
    if (!cache) fetchPrices();
    else setPrices(cache);
    const id = setInterval(fetchPrices, 60_000);
    return () => { listeners.delete(listener); clearInterval(id); };
  }, []);

  return prices;
}

/** Convert a coin amount to a USD value using current prices. */
export function toUsd(coin: CoinKey, amount: number, prices: Record<CoinKey, number>): number {
  return amount * (prices[coin] ?? 0);
}

/** Pretty-print USD with sensible precision. */
export function fmtUsd(n: number): string {
  if (!isFinite(n) || n === 0) return "$0.00";
  if (Math.abs(n) >= 10000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (Math.abs(n) >= 1)     return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (Math.abs(n) >= 0.01)  return `$${n.toFixed(4)}`;
  return `$${n.toFixed(8).replace(/0+$/, "0")}`;
}

/** Pretty-print a coin amount with a sensible number of decimals. */
export function fmtCoin(amount: number): string {
  if (!isFinite(amount)) return "0";
  if (amount === 0) return "0.000000";
  if (Math.abs(amount) >= 1000) return amount.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return amount.toFixed(6);
}
