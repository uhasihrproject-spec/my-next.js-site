"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp, ArrowDownToLine, ArrowUpFromLine,
  LogOut, Copy, CheckCheck, Loader2, Lock, ShieldCheck,
  ArrowRight, ArrowLeft, AlertCircle, Check,
  Wallet, Activity, Plus, LineChart, Settings as SettingsIcon,
  X, Bell, RefreshCw, Sparkles, KeyRound, Fingerprint, Mail,
  BadgeCheck, Calculator, Newspaper, ArrowUpDown, ExternalLink,
  ScanFace, Download, Receipt as ReceiptIcon, Eye, EyeOff,
} from "lucide-react";
import type { CoinKey } from "@/lib/db";
import ChatWidget from "@/components/ChatWidget";

/* ─── Constants ─── */
const COINS: CoinKey[] = ["BTC", "ETH", "USDT", "BNB", "SOL", "USDC"];
const COIN_COLOR: Record<CoinKey, string> = {
  BTC: "#f7931a", ETH: "#627eea", USDT: "#26a17b",
  BNB: "#f0b90b", SOL: "#9945ff", USDC: "#2775ca",
};
const COIN_NAME: Record<CoinKey, string> = {
  BTC: "Bitcoin", ETH: "Ethereum", USDT: "Tether",
  BNB: "BNB Chain", SOL: "Solana", USDC: "USD Coin",
};
const COIN_SYMBOL: Record<CoinKey, string> = {
  BTC: "₿", ETH: "Ξ", USDT: "₮", BNB: "B", SOL: "◎", USDC: "$",
};

type Tab = "portfolio" | "markets" | "news" | "activity";
type DepositStep = "coin" | "address" | "amount" | "hash" | "confirming" | "confirmed";
type WithdrawStep = "coin" | "amount" | "address" | "verify" | "confirming" | "confirmed";

/* ─── Types ─── */
interface UserData {
  id: string; name: string; email: string;
  balance: Partial<Record<CoinKey, number>>;
  earnings: Partial<Record<CoinKey, number>>;
  deposits: { id: string; coin: CoinKey; amount: number; txHash: string; status: string; note?: string; date: string }[];
  withdrawals: { id: string; coin: CoinKey; amount: number; address: string; status: string; note?: string; requestDate: string }[];
  withdrawalUnlockDate: string | null;
  customLock: boolean;
}
interface Settings {
  globalWithdrawalLock: boolean;
  globalWithdrawalLockReason: string;
  adminWallets: Partial<Record<CoinKey, string>>;
}
interface MarketCoin {
  id: string; symbol: string; name: string; image: string;
  current_price: number; price_change_percentage_24h: number | null;
  market_cap: number; total_volume: number;
  sparkline_in_7d?: { price: number[] };
}

/* ─── Formatters ─── */
function fmtUsd(n: number) {
  if (n >= 1) return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}
function fmtCompact(n: number) {
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(0);
}

/* ─── Status badge ─── */
function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:    "text-amber-400 bg-amber-400/[0.08] border-amber-400/15",
    confirmed:  "text-emerald-400 bg-emerald-400/[0.08] border-emerald-400/15",
    completed:  "text-emerald-400 bg-emerald-400/[0.08] border-emerald-400/15",
    rejected:   "text-red-400 bg-red-400/[0.08] border-red-400/15",
    processing: "text-blue-400 bg-blue-400/[0.08] border-blue-400/15",
  };
  return (
    <span className={`inline-flex items-center px-2 py-[3px] rounded text-[10px] font-normal tracking-wider uppercase border ${map[status] || "text-zinc-400 bg-zinc-400/[0.08] border-zinc-400/15"}`}>
      {status}
    </span>
  );
}

/* ─── Address display: full text + one-tap copy ─── */
function AddressBox({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }
  return (
    <div>
      {label && <p className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase mb-2">{label}</p>}
      <button onClick={copy}
        className="group w-full text-left bg-[#0c0c0d] border border-white/[0.07] hover:border-white/[0.14] rounded-xl p-4 transition-colors">
        <p className="text-[13px] font-mono text-zinc-200 break-all leading-relaxed select-all">{value}</p>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.05]">
          {copied ? (
            <>
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-normal text-emerald-400">Address copied to clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              <span className="text-[11px] font-light text-zinc-500 group-hover:text-zinc-300 transition-colors">Tap to copy address</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}

/* ─── Inline copy chip (small) ─── */
function CopyChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-normal transition-colors shrink-0 ${
        copied ? "bg-emerald-400/10 text-emerald-400" : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {copied ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/* ─── Greeting ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/* ─── Step dots ─── */
function StepDots({ steps, current }: { steps: string[]; current: string }) {
  const idx = steps.indexOf(current);
  return (
    <div className="flex gap-1">
      {steps.map((s, i) => (
        <div key={s} className={`h-[3px] rounded-full transition-all duration-300 ${
          i === idx ? "w-5 bg-blue-500" : i < idx ? "w-2 bg-emerald-500/40" : "w-2 bg-white/[0.08]"
        }`} />
      ))}
    </div>
  );
}

/* ─── Spinning ring ─── */
function SpinningRing({ color }: { color: string }) {
  return (
    <div className="relative w-28 h-28">
      <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(255,255,255,0.05)" }} />
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: "2px solid transparent", borderTopColor: color, borderRightColor: color + "22" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color }} />
      </div>
    </div>
  );
}

/* ─── Success ring ─── */
function SuccessRing() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 14, stiffness: 200 }}
      className="relative w-28 h-28"
    >
      <motion.div className="absolute inset-0 rounded-full"
        style={{ border: "2px solid rgba(52,211,153,0.35)" }}
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }} />
      <motion.div className="absolute inset-0 rounded-full"
        style={{ backgroundColor: "rgba(52,211,153,0.06)" }}
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05 }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 10, stiffness: 300 }}>
          <Check className="w-12 h-12 text-emerald-400" strokeWidth={1.5} />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Coin glyph ─── */
function CoinGlyph({ coin, size = 40 }: { coin: CoinKey; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size, height: size,
        backgroundColor: COIN_COLOR[coin] + "16",
        color: COIN_COLOR[coin],
        fontSize: size * 0.42,
      }}
    >
      {COIN_SYMBOL[coin]}
    </div>
  );
}

/* ─── Sparkline ─── */
function Sparkline({ data, positive, w = 64, h = 24 }: { data: number[]; positive: boolean; w?: number; h?: number }) {
  if (!data || data.length < 2) return <div style={{ width: w, height: h }} />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 2 - ((v - min) / range) * (h - 4);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const color = positive ? "#34d399" : "#f87171";
  return (
    <svg width={w} height={h} className="overflow-visible shrink-0">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Stacked balance card ─── */
function BalanceStack({ user, activeCoins, locked, hidden, onToggleHidden }: {
  user: UserData; activeCoins: CoinKey[]; locked: boolean;
  hidden: boolean; onToggleHidden: () => void;
}) {
  const n = activeCoins.length;
  const [index, setIndex] = useState(0);
  useEffect(() => { if (index >= n) setIndex(0); }, [n, index]);
  const safeIndex = index < n ? index : 0;

  /* ── No assets — single default card ── */
  if (n === 0) {
    return (
      <div className="relative mb-7">
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-3 w-[90%] h-full rounded-2xl bg-[#15151a] border border-white/[0.05]" />
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 190 }}
          className="relative rounded-2xl p-5 overflow-hidden border border-white/[0.09]"
          style={{ background: "linear-gradient(140deg, #1c2233 0%, #13141b 52%, #0e0f14 100%)" }}
        >
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center">
                <TrendingUp className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[12px] font-normal text-white tracking-wide">VaultX</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
              <Lock className="w-2.5 h-2.5 text-zinc-400" />
              <span className="text-[9px] font-light text-zinc-400 tracking-wide">Secured</span>
            </div>
          </div>
          <p className="text-[10px] font-normal tracking-[0.18em] text-blue-300/50 uppercase mb-1.5">Portfolio</p>
          <p className="text-[28px] font-light text-white font-mono leading-none mb-2">0.00000</p>
          <p className="text-[11px] font-light text-zinc-500 mb-7">No assets yet — make your first deposit to begin.</p>
          <div>
            <p className="text-[8px] font-normal tracking-[0.16em] text-zinc-600 uppercase mb-1">Account holder</p>
            <p className="text-[12px] font-light text-zinc-300 tracking-wide uppercase truncate max-w-[200px]">{user.name}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Coin cards — swipe up to cycle ── */
  const cards = activeCoins
    .map((coin, i) => ({ coin, pos: (i - safeIndex + n) % n }))
    .filter((c) => c.pos <= 2)
    .sort((a, b) => b.pos - a.pos);

  return (
    <div className="relative mb-7" style={{ height: 224 }}>
      {cards.map(({ coin, pos }) => {
        const isFront = pos === 0;
        const bal = (user.balance[coin] || 0) + (user.earnings[coin] || 0);
        const earn = user.earnings[coin] || 0;
        const base = user.balance[coin] || 0;
        const pct = base > 0 ? ((earn / base) * 100).toFixed(2) : null;
        const c = COIN_COLOR[coin];
        return (
          <motion.div
            key={coin}
            drag={isFront && n > 1 ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.6, bottom: 0.1 }}
            onDragEnd={(_, info) => { if (info.offset.y < -55) setIndex((p) => (p + 1) % n); }}
            animate={{ y: pos * 13, scale: 1 - pos * 0.05 }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            style={{
              zIndex: 10 - pos,
              backgroundColor: "#0e0f14",
              backgroundImage: `linear-gradient(140deg, ${c}26 0%, #13141b 55%, #0e0f14 100%)`,
            }}
            className={`absolute inset-x-0 top-0 h-[196px] rounded-2xl p-5 overflow-hidden border border-white/[0.09] ${
              isFront && n > 1 ? "cursor-grab active:cursor-grabbing" : ""
            }`}
          >
            <div className="absolute -top-14 -right-10 w-44 h-44 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, ${c}30 0%, transparent 70%)` }} />
            {/* Depth scrim — dims cards behind the front one (kept fully opaque). */}
            <motion.div
              className="absolute inset-0 z-20 bg-black pointer-events-none"
              animate={{ opacity: pos === 0 ? 0 : pos === 1 ? 0.42 : 0.62 }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
            />

            <div className="relative z-10 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span className="text-[12px] font-normal text-white tracking-wide">VaultX</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={onToggleHidden} onPointerDown={(e) => e.stopPropagation()}
                    title={hidden ? "Show balance" : "Hide balance"}
                    className="w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                    {hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]">
                    <Lock className="w-2.5 h-2.5 text-zinc-400" />
                    <span className="text-[9px] font-light text-zinc-400 tracking-wide">{locked ? "Locked" : "Secured"}</span>
                  </div>
                </div>
              </div>

              {/* Coin + balance */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <CoinGlyph coin={coin} size={30} />
                <div>
                  <p className="text-[11px] font-normal tracking-wider uppercase" style={{ color: c }}>{coin}</p>
                  <p className="text-[10px] font-light text-zinc-500 leading-none mt-0.5">{COIN_NAME[coin]}</p>
                </div>
              </div>
              <p className="text-[27px] font-light text-white font-mono leading-none">
                {hidden ? "••••••" : bal.toFixed(6)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <p className="text-[11px] font-light text-emerald-400 font-mono">
                  {hidden ? "••••" : `+${earn.toFixed(6)}`}
                </p>
                {pct && !hidden && <span className="text-[10px] font-light text-emerald-400/60">+{pct}%</span>}
              </div>

              {/* Footer */}
              <div className="mt-auto flex items-end justify-between">
                <div className="min-w-0">
                  <p className="text-[8px] font-normal tracking-[0.16em] text-zinc-600 uppercase mb-1">Account holder</p>
                  <p className="text-[11px] font-light text-zinc-300 tracking-wide uppercase truncate max-w-[150px]">{user.name}</p>
                </div>
                {n > 1 && (
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex gap-1">
                      {activeCoins.map((_, di) => (
                        <span key={di} className={`h-1 rounded-full transition-all ${di === safeIndex ? "w-3.5 bg-blue-400" : "w-1 bg-white/15"}`} />
                      ))}
                    </div>
                    <p className="text-[8.5px] font-light text-zinc-600 tracking-wide">↑ swipe · {safeIndex + 1}/{n}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════
   DEPOSIT OVERLAY
════════════════════════════════════════ */
function DepositOverlay({
  settings, onClose, onSuccess,
}: { settings: Settings | null; onClose: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState<DepositStep>("coin");
  const [dir, setDir] = useState(1);
  const [coin, setCoin] = useState<CoinKey>("BTC");
  const [amount, setAmount] = useState("");
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");

  function go(next: DepositStep, d = 1) { setDir(d); setStep(next); }

  async function submit() {
    setError("");
    go("confirming");
    try {
      const r = await fetch("/api/deposits", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin, amount: parseFloat(amount), txHash: hash }),
      });
      if (r.ok) { go("confirmed"); onSuccess(); }
      else { const d = await r.json(); go("hash", -1); setError(d.error || "Submission failed."); }
    } catch { go("hash", -1); setError("Network error. Please try again."); }
  }

  const FLOW: DepositStep[] = ["coin", "address", "amount", "hash"];
  const addr = settings?.adminWallets?.[coin];

  const variants = {
    initial: (d: number) => ({ x: d * 28, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" as const } },
    exit: (d: number) => ({ x: d * -28, opacity: 0, transition: { duration: 0.16 } }),
  };

  const stepTitle: Record<DepositStep, string> = {
    coin: "Select asset", address: "Deposit address",
    amount: "Amount sent", hash: "Transaction proof",
    confirming: "", confirmed: "",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[50] bg-black/70 backdrop-blur-sm"
        onClick={step === "confirming" ? undefined : onClose}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="fixed inset-x-0 bottom-0 z-[60] bg-[#101012] border-t border-white/[0.06] rounded-t-3xl flex flex-col md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:rounded-3xl md:border md:max-w-md md:w-full"
        style={{ maxHeight: "92vh" }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0 md:hidden">
          <div className="w-9 h-1 rounded-full bg-white/[0.1]" />
        </div>

        {step !== "confirming" && step !== "confirmed" && (
          <div className="flex items-center gap-3 px-5 py-4 shrink-0 border-b border-white/[0.05]">
            <button
              onClick={() => {
                const backs: Partial<Record<DepositStep, DepositStep>> = { address: "coin", amount: "address", hash: "amount" };
                if (step === "coin") onClose();
                else go(backs[step]!, -1);
              }}
              className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <p className="text-[9px] font-normal tracking-[0.2em] text-zinc-600 uppercase mb-0.5">Deposit · Step {FLOW.indexOf(step) + 1} of {FLOW.length}</p>
              <p className="text-[15px] font-normal text-white">{stepTitle[step]}</p>
            </div>
            <StepDots steps={FLOW} current={step} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={dir}>

            {/* ── Step 1: Coin ── */}
            {step === "coin" && (
              <motion.div key="coin" variants={variants} initial="initial" animate="animate" exit="exit" custom={dir}
                className="px-5 pt-5 pb-8">
                <p className="text-[13px] font-light text-zinc-500 mb-5">Choose the asset you&apos;re depositing.</p>
                <div className="divide-y divide-white/[0.04] border-y border-white/[0.04]">
                  {COINS.map((c, i) => {
                    const configured = !!settings?.adminWallets?.[c];
                    return (
                      <motion.button key={c}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, ease: "easeOut" }}
                        onClick={() => { setCoin(c); go("address"); }}
                        className="w-full flex items-center gap-4 py-4 hover:bg-white/[0.02] transition-colors group"
                      >
                        <CoinGlyph coin={c} />
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-[14px] font-normal text-zinc-100">{COIN_NAME[c]}</p>
                          <p className="text-[11px] font-light text-zinc-600 mt-0.5">{c}{configured ? "" : " · address pending"}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Address ── */}
            {step === "address" && (
              <motion.div key="address" variants={variants} initial="initial" animate="animate" exit="exit" custom={dir}
                className="px-5 pt-5 pb-8">
                <div className="flex items-center gap-3 mb-6">
                  <CoinGlyph coin={coin} size={36} />
                  <div>
                    <p className="text-[14px] font-normal text-white">{COIN_NAME[coin]}</p>
                    <p className="text-[11px] font-light text-zinc-600">Send <span className="font-mono text-zinc-400">{coin}</span> on the {COIN_NAME[coin]} network</p>
                  </div>
                </div>

                {addr ? (
                  <AddressBox value={addr} label={`Your ${coin} deposit address`} />
                ) : (
                  <div className="bg-[#0c0c0d] border border-white/[0.05] rounded-xl p-5 text-center">
                    <AlertCircle className="w-5 h-5 text-zinc-500 mx-auto mb-2" />
                    <p className="text-[13px] font-light text-zinc-400">This address isn&apos;t set up yet</p>
                    <p className="text-[11px] font-light text-zinc-600 mt-1">Please contact support for instructions.</p>
                  </div>
                )}

                <div className="flex items-start gap-2.5 mt-5 mb-6 px-3.5 py-3 rounded-lg bg-amber-400/[0.05] border border-amber-400/15">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-light text-amber-300/75 leading-relaxed">
                    Send only <span className="font-mono text-amber-200">{coin}</span> to this address. Other assets will be lost permanently.
                  </p>
                </div>

                <button onClick={() => go("amount")} disabled={!addr}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-[13px] font-normal rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  I&apos;ve sent the funds <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Step 3: Amount ── */}
            {step === "amount" && (
              <motion.div key="amount" variants={variants} initial="initial" animate="animate" exit="exit" custom={dir}
                className="px-5 pt-5 pb-8">
                <p className="text-[13px] font-light text-zinc-500 mb-8">Enter the exact amount you sent on-chain.</p>

                <div className="flex flex-col items-center mb-8">
                  <CoinGlyph coin={coin} size={44} />
                  <input
                    type="number" step="any" min="0" autoFocus
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="mt-4 w-full text-[44px] font-light text-white placeholder-zinc-800 focus:outline-none bg-transparent [appearance:textfield] leading-none text-center"
                  />
                  <span className="text-[12px] font-light text-zinc-600 mt-1 uppercase tracking-wider">{coin}</span>
                  <div className="h-px bg-white/[0.06] w-full mt-5" />
                </div>

                <button
                  onClick={() => { if (amount && parseFloat(amount) > 0) go("hash"); }}
                  className={`w-full py-3.5 text-[13px] font-normal rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    amount && parseFloat(amount) > 0
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-white/[0.03] border border-white/[0.06] text-zinc-700 cursor-not-allowed"
                  }`}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Step 4: Hash ── */}
            {step === "hash" && (
              <motion.div key="hash" variants={variants} initial="initial" animate="animate" exit="exit" custom={dir}
                className="px-5 pt-5 pb-8">
                <p className="text-[13px] font-light text-zinc-500 mb-6">Paste your transaction ID — find it in your wallet&apos;s send history.</p>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-lg bg-red-400/[0.06] border border-red-400/15 text-red-400 text-[12px] font-light mb-4 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase mb-2">Transaction hash</p>
                <textarea
                  value={hash} onChange={(e) => setHash(e.target.value)}
                  placeholder="0x1a2b3c4d5e6f…"
                  rows={3} autoFocus
                  className="w-full text-[13px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none bg-[#0c0c0d] border border-white/[0.07] focus:border-white/[0.18] rounded-xl p-3.5 resize-none transition-colors"
                />

                <div className="mt-5 mb-5 bg-[#0c0c0d] border border-white/[0.05] rounded-xl divide-y divide-white/[0.04]">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[11px] font-light text-zinc-600">Asset</span>
                    <div className="flex items-center gap-2">
                      <CoinGlyph coin={coin} size={20} />
                      <span className="text-[13px] font-normal text-zinc-200">{COIN_NAME[coin]}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[11px] font-light text-zinc-600">Amount</span>
                    <span className="text-[13px] font-normal text-white font-mono">{amount} {coin}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[11px] font-light text-zinc-600">Status</span>
                    <Badge status="pending" />
                  </div>
                </div>

                <button onClick={submit} disabled={!hash.trim()}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-[13px] font-normal rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  Submit for confirmation <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Confirming ── */}
            {step === "confirming" && (
              <motion.div key="confirming" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center px-5 pt-12 pb-12">
                <SpinningRing color={COIN_COLOR[coin]} />
                <motion.div className="text-center mt-7" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <p className="text-[20px] font-light text-white mb-1.5">Submitting deposit</p>
                  <p className="text-[12px] font-light text-zinc-500">Sending your transaction for review</p>
                </motion.div>
              </motion.div>
            )}

            {/* ── Confirmed ── */}
            {step === "confirmed" && (
              <motion.div key="confirmed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center px-5 pt-12 pb-10">
                <SuccessRing />
                <motion.div className="text-center mt-7" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                  <p className="text-[22px] font-light text-white mb-1.5">Deposit submitted</p>
                  <p className="text-[13px] font-light text-zinc-400">
                    <span className="font-mono text-zinc-200">{amount} {coin}</span> is under review
                  </p>
                  <p className="text-[11px] font-light text-zinc-600 mt-1.5">You&apos;ll see it credited once confirmed.</p>
                </motion.div>
                <motion.div className="w-full mt-9 space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  <button onClick={onClose}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-xl transition-all active:scale-[0.98]">
                    Return to portfolio
                  </button>
                  <button onClick={() => { setCoin("BTC"); setAmount(""); setHash(""); setError(""); setDir(1); setStep("coin"); }}
                    className="w-full py-2.5 text-zinc-600 hover:text-zinc-300 text-[12px] font-light rounded-xl transition-colors">
                    Make another deposit
                  </button>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

/* ════════════════════════════════════════
   WITHDRAW OVERLAY
════════════════════════════════════════ */
function WithdrawOverlay({
  user, onClose, onSuccess, lockStatus,
}: {
  user: UserData;
  onClose: () => void; onSuccess: () => void;
  lockStatus: { locked: boolean; reason: string | null } | null;
}) {
  const [step, setStep] = useState<WithdrawStep>("coin");
  const [dir, setDir] = useState(1);
  const [coin, setCoin] = useState<CoinKey>("BTC");
  const [amount, setAmount] = useState("");
  const [addr, setAddr] = useState("");
  const [error, setError] = useState("");
  const [receiptRef] = useState(() => "WX-" + Math.random().toString(36).slice(2, 8).toUpperCase());
  const [receiptAt] = useState(() => new Date());

  function go(next: WithdrawStep, d = 1) { setDir(d); setStep(next); }

  const receiptData: ReceiptData = {
    ref: receiptRef,
    dateLabel: receiptAt.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    coin, amount, destination: addr, status: "pending",
  };
  const available = (user.balance[coin] || 0) + (user.earnings[coin] || 0);

  async function submit() {
    setError("");
    go("confirming");
    try {
      const r = await fetch("/api/withdrawals", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin, amount: parseFloat(amount), address: addr }),
      });
      if (r.ok) { go("confirmed"); onSuccess(); }
      else { const d = await r.json(); go("address", -1); setError(d.error || "Request failed."); }
    } catch { go("address", -1); setError("Network error. Please try again."); }
  }

  const FLOW: WithdrawStep[] = ["coin", "amount", "address"];

  const variants = {
    initial: (d: number) => ({ x: d * 28, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.22, ease: "easeOut" as const } },
    exit: (d: number) => ({ x: d * -28, opacity: 0, transition: { duration: 0.16 } }),
  };

  const stepTitle: Record<WithdrawStep, string> = {
    coin: "Select asset", amount: "Withdrawal amount",
    address: "Destination wallet", verify: "", confirming: "", confirmed: "",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[50] bg-black/70 backdrop-blur-sm"
        onClick={step === "confirming" ? undefined : onClose}
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="fixed inset-x-0 bottom-0 z-[60] bg-[#101012] border-t border-white/[0.06] rounded-t-3xl flex flex-col md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:rounded-3xl md:border md:max-w-md md:w-full"
        style={{ maxHeight: "92vh" }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0 md:hidden">
          <div className="w-9 h-1 rounded-full bg-white/[0.1]" />
        </div>

        {step !== "confirming" && step !== "confirmed" && step !== "verify" && (
          <div className="flex items-center gap-3 px-5 py-4 shrink-0 border-b border-white/[0.05]">
            <button
              onClick={() => {
                const backs: Partial<Record<WithdrawStep, WithdrawStep>> = { amount: "coin", address: "amount" };
                if (step === "coin") onClose();
                else go(backs[step]!, -1);
              }}
              className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1">
              <p className="text-[9px] font-normal tracking-[0.2em] text-zinc-600 uppercase mb-0.5">Withdraw · Step {FLOW.indexOf(step) + 1} of {FLOW.length}</p>
              <p className="text-[15px] font-normal text-white">{stepTitle[step]}</p>
            </div>
            <StepDots steps={FLOW} current={step} />
          </div>
        )}

        {lockStatus?.locked && (step === "coin" || step === "amount") && (
          <div className="mx-5 mt-4 flex items-start gap-2.5 bg-amber-400/[0.06] border border-amber-400/15 rounded-lg px-3.5 py-3 shrink-0">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] font-light text-amber-300/80 leading-relaxed">{lockStatus.reason}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={dir}>

            {/* ── Step 1: Coin ── */}
            {step === "coin" && (
              <motion.div key="coin" variants={variants} initial="initial" animate="animate" exit="exit" custom={dir}
                className="px-5 pt-5 pb-8">
                <p className="text-[13px] font-light text-zinc-500 mb-5">Pick the asset to withdraw.</p>
                <div className="divide-y divide-white/[0.04] border-y border-white/[0.04]">
                  {COINS.map((c, i) => {
                    const total = (user.balance[c] || 0) + (user.earnings[c] || 0);
                    return (
                      <motion.button key={c}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, ease: "easeOut" }}
                        onClick={() => { setCoin(c); go("amount"); }}
                        disabled={lockStatus?.locked || total === 0}
                        className="w-full flex items-center gap-4 py-4 hover:bg-white/[0.02] disabled:opacity-30 disabled:hover:bg-transparent transition-colors group"
                      >
                        <CoinGlyph coin={c} />
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-[14px] font-normal text-zinc-100">{COIN_NAME[c]}</p>
                          <p className="text-[11px] font-light text-zinc-600 mt-0.5">{c}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-[14px] font-light font-mono ${total > 0 ? "text-zinc-200" : "text-zinc-700"}`}>{total.toFixed(4)}</p>
                          <p className="text-[10px] font-light text-zinc-700 mt-0.5">{total > 0 ? "Available" : "—"}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Amount ── */}
            {step === "amount" && (
              <motion.div key="amount" variants={variants} initial="initial" animate="animate" exit="exit" custom={dir}
                className="px-5 pt-5 pb-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2.5">
                    <CoinGlyph coin={coin} size={28} />
                    <p className="text-[13px] font-light text-zinc-500">
                      Available: <span className="text-zinc-300 font-mono">{available.toFixed(6)}</span>
                    </p>
                  </div>
                  <button onClick={() => setAmount(available.toFixed(8))}
                    className="px-2.5 py-1 bg-blue-500/15 border border-blue-500/25 text-blue-400 text-[10px] font-normal tracking-wider rounded-md hover:bg-blue-500/25 transition-colors">
                    MAX
                  </button>
                </div>

                <div className="flex flex-col items-center mb-8">
                  <input
                    type="number" step="any" min="0" autoFocus
                    value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-[44px] font-light text-white placeholder-zinc-800 focus:outline-none bg-transparent [appearance:textfield] leading-none text-center"
                  />
                  <span className="text-[12px] font-light text-zinc-600 mt-1 uppercase tracking-wider">{coin}</span>
                  <div className="h-px bg-white/[0.06] w-full mt-5" />
                </div>

                <button
                  onClick={() => { if (amount && parseFloat(amount) > 0 && parseFloat(amount) <= available) go("address"); }}
                  className={`w-full py-3.5 text-[13px] font-normal rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                    amount && parseFloat(amount) > 0 && parseFloat(amount) <= available
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-white/[0.03] border border-white/[0.06] text-zinc-700 cursor-not-allowed"
                  }`}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
                {amount && parseFloat(amount) > available && (
                  <p className="text-center text-[11px] font-light text-red-400 mt-3">Amount exceeds available balance</p>
                )}
              </motion.div>
            )}

            {/* ── Step 3: Address ── */}
            {step === "address" && (
              <motion.div key="address" variants={variants} initial="initial" animate="animate" exit="exit" custom={dir}
                className="px-5 pt-5 pb-8">
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="px-4 py-3 rounded-lg bg-red-400/[0.06] border border-red-400/15 text-red-400 text-[12px] font-light mb-4 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-[13px] font-light text-zinc-500 mb-5">Where should we send your {coin}?</p>

                <p className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase mb-2">{coin} wallet address</p>
                <input
                  type="text" value={addr} onChange={(e) => setAddr(e.target.value)}
                  placeholder={`Paste your ${coin} address`} autoFocus
                  className="w-full text-[13px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none bg-[#0c0c0d] border border-white/[0.07] focus:border-white/[0.18] rounded-xl p-3.5 transition-colors"
                />
                <div className="flex items-start gap-2 mt-3 mb-6">
                  <AlertCircle className="w-3 h-3 text-amber-400/70 shrink-0 mt-0.5" />
                  <p className="text-[10.5px] font-light text-amber-400/70 leading-relaxed">
                    Double-check this address. Blockchain transactions can&apos;t be reversed.
                  </p>
                </div>

                <div className="bg-[#0c0c0d] border border-white/[0.05] rounded-xl divide-y divide-white/[0.04] mb-5">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[11px] font-light text-zinc-600">Asset</span>
                    <div className="flex items-center gap-2">
                      <CoinGlyph coin={coin} size={20} />
                      <span className="text-[13px] font-normal text-zinc-200">{COIN_NAME[coin]}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[11px] font-light text-zinc-600">Amount</span>
                    <span className="text-[13px] font-normal text-white font-mono">{amount} {coin}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[11px] font-light text-zinc-600">Processing</span>
                    <span className="text-[11px] font-light text-zinc-400">24–48 hours</span>
                  </div>
                </div>

                <button onClick={() => { if (addr.trim()) go("verify"); }} disabled={!addr.trim()}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-[13px] font-normal rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  Submit withdrawal request <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── Verify — PIN / biometric ── */}
            {step === "verify" && (
              <motion.div key="verify" variants={variants} initial="initial" animate="animate" exit="exit" custom={dir}>
                <VerifyPin
                  user={user}
                  title={`Authorize this withdrawal of ${amount} ${coin} with your PIN or biometrics.`}
                  onVerified={submit}
                  onCancel={() => go("address", -1)}
                />
              </motion.div>
            )}

            {/* ── Confirming ── */}
            {step === "confirming" && (
              <motion.div key="confirming" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center px-5 pt-12 pb-12">
                <SpinningRing color={COIN_COLOR[coin]} />
                <motion.div className="text-center mt-7" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <p className="text-[20px] font-light text-white mb-1.5">Submitting request</p>
                  <p className="text-[12px] font-light text-zinc-500">Sending your withdrawal for review</p>
                </motion.div>
              </motion.div>
            )}

            {/* ── Confirmed — Receipt ── */}
            {step === "confirmed" && (
              <motion.div key="confirmed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center px-5 pt-9 pb-8">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 13, stiffness: 240 }}
                  className="w-14 h-14 rounded-full bg-emerald-400/[0.1] border border-emerald-400/30 flex items-center justify-center mb-3"
                >
                  <Check className="w-7 h-7 text-emerald-400" strokeWidth={2} />
                </motion.div>
                <p className="text-[18px] font-light text-white mb-1">Withdrawal requested</p>
                <p className="text-[12px] font-light text-zinc-600 mb-6">Keep this receipt for your records</p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, type: "spring", damping: 21, stiffness: 200 }}
                  className="w-full"
                >
                  <ReceiptCard data={receiptData} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="w-full mt-8 space-y-2"
                >
                  <button onClick={() => downloadReceipt(receiptData)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-200 text-[13px] font-normal rounded-xl transition-all active:scale-[0.98]">
                    <Download className="w-4 h-4" /> Save receipt
                  </button>
                  <button onClick={onClose}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-xl transition-all active:scale-[0.98]">
                    Return to portfolio
                  </button>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

/* ════════════════════════════════════════
   SHARED CONTENT — Portfolio & Activity
════════════════════════════════════════ */
function PortfolioContent({
  user, activeCoins, hasAnyBalance, lockStatus, onDeposit, hidden,
}: {
  user: UserData; activeCoins: CoinKey[]; hasAnyBalance: boolean;
  lockStatus: { locked: boolean; reason: string | null } | null; onDeposit: () => void;
  hidden: boolean;
}) {
  return (
    <motion.div key="portfolio" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

      {/* Lock notice */}
      <AnimatePresence>
        {lockStatus?.locked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-400/[0.04] border border-amber-400/15">
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[12px] font-light text-amber-300/80 leading-relaxed">{lockStatus.reason}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holdings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-normal tracking-[0.18em] text-zinc-600 uppercase">Holdings</p>
          {hasAnyBalance && <p className="text-[11px] font-light text-zinc-700">{activeCoins.length} active</p>}
        </div>

        {hasAnyBalance ? (
          <>
            {/* Desktop table */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="hidden md:block border-t border-white/[0.06]"
            >
              <div className="grid grid-cols-[2.2fr_1.4fr_1.4fr_1fr] gap-4 px-3 py-2.5 border-b border-white/[0.05]">
                <span className="text-[10px] font-normal tracking-widest uppercase text-zinc-600">Asset</span>
                <span className="text-[10px] font-normal tracking-widest uppercase text-zinc-600 text-right">Balance</span>
                <span className="text-[10px] font-normal tracking-widest uppercase text-zinc-600 text-right">Earned</span>
                <span className="text-[10px] font-normal tracking-widest uppercase text-zinc-600 text-right">Yield</span>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {COINS.map((c, i) => {
                  const bal = user.balance[c] || 0;
                  const earn = user.earnings[c] || 0;
                  const total = bal + earn;
                  if (total === 0) return null;
                  const pct = bal > 0 ? ((earn / bal) * 100).toFixed(2) : null;
                  return (
                    <motion.div key={c}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.04, ease: "easeOut" }}
                      className="grid grid-cols-[2.2fr_1.4fr_1.4fr_1fr] gap-4 items-center px-3 py-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CoinGlyph coin={c} size={34} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-normal text-zinc-100 truncate">{COIN_NAME[c]}</p>
                          <p className="text-[10px] font-light text-zinc-600 mt-0.5">{c}</p>
                        </div>
                      </div>
                      <p className="text-[13px] font-light text-white font-mono text-right">{hidden ? "••••" : total.toFixed(6)}</p>
                      <p className="text-[13px] font-light text-emerald-400/80 font-mono text-right">{hidden ? "••••" : `+${earn.toFixed(6)}`}</p>
                      <p className="text-[12px] font-light text-emerald-400 font-mono text-right">{hidden ? "••" : pct ? `+${pct}%` : "—"}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Mobile list */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="md:hidden divide-y divide-white/[0.04] border-y border-white/[0.04]"
            >
              {COINS.map((c, i) => {
                const bal = user.balance[c] || 0;
                const earn = user.earnings[c] || 0;
                const total = bal + earn;
                if (total === 0) return null;
                const pct = bal > 0 ? ((earn / bal) * 100).toFixed(2) : null;
                return (
                  <motion.div key={c}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.04, ease: "easeOut" }}
                    className="flex items-center gap-4 py-4"
                  >
                    <CoinGlyph coin={c} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-normal text-zinc-100">{COIN_NAME[c]}</p>
                      <p className="text-[11px] font-light text-zinc-600 mt-0.5">{c}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-light text-white font-mono">{hidden ? "••••" : total.toFixed(4)}</p>
                      <div className="flex items-center justify-end gap-1.5 mt-0.5">
                        <span className="text-[11px] font-light text-emerald-400/80 font-mono">{hidden ? "••••" : `+${earn.toFixed(4)}`}</span>
                        {!hidden && pct && <span className="text-[10px] font-light text-emerald-400/60">· +{pct}%</span>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center py-16 px-4 border border-dashed border-white/[0.07] rounded-2xl"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/[0.08] border border-blue-500/15 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-5 h-5 text-blue-400/70" />
            </div>
            <p className="text-[15px] font-light text-zinc-300 mb-1">Your portfolio is empty</p>
            <p className="text-[12px] font-light text-zinc-600 mb-6 max-w-[300px] mx-auto leading-relaxed">
              Make your first deposit to start earning passive yield on your crypto.
            </p>
            <button onClick={onDeposit}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-normal rounded-lg transition-colors active:scale-[0.98]">
              <Plus className="w-3.5 h-3.5" /> Make first deposit
            </button>
          </motion.div>
        )}
      </div>

      {/* Trust footer */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        className="mt-10 pt-6 border-t border-white/[0.04] flex items-center justify-center gap-2 text-zinc-700"
      >
        <ShieldCheck className="w-3 h-3" />
        <p className="text-[10px] font-light tracking-wide">Funds held in cold storage · End-to-end encrypted</p>
      </motion.div>
    </motion.div>
  );
}

function ActivityContent({
  user, sub, setSub, onOpenReceipt,
}: {
  user: UserData;
  sub: "deposits" | "withdrawals";
  setSub: (s: "deposits" | "withdrawals") => void;
  onOpenReceipt: (d: ReceiptData) => void;
}) {
  return (
    <motion.div key="activity" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 mb-6">
        {([
          { id: "deposits"    as const, label: "Deposits",    count: user.deposits.length },
          { id: "withdrawals" as const, label: "Withdrawals", count: user.withdrawals.length },
        ]).map(({ id, label, count }) => (
          <button key={id} onClick={() => setSub(id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-light transition-colors ${
              sub === id ? "bg-white/[0.06] text-white" : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.03]"
            }`}
          >
            {label}
            <span className={`text-[10px] font-mono ${sub === id ? "text-zinc-400" : "text-zinc-700"}`}>{count}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {sub === "deposits" && (
          <motion.div key="dep" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {!user.deposits.length ? (
              <div className="text-center py-16 border border-dashed border-white/[0.07] rounded-2xl">
                <ArrowDownToLine className="w-5 h-5 text-zinc-700 mx-auto mb-3" />
                <p className="text-[13px] font-light text-zinc-500">No deposits yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04] border-y border-white/[0.04]">
                {[...user.deposits].reverse().map((d, i) => (
                  <motion.div key={d.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="py-4 flex items-start gap-4"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/[0.08] border border-blue-500/15 flex items-center justify-center shrink-0">
                      <ArrowDownToLine className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                        <p className="text-[14px] font-normal text-zinc-100 font-mono">
                          {d.amount} <span className="text-zinc-500">{d.coin}</span>
                        </p>
                        <Badge status={d.status} />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-light text-zinc-600 font-mono truncate flex-1">{d.txHash}</p>
                        <CopyChip value={d.txHash} />
                      </div>
                      {d.note && <p className="text-[11px] font-light text-zinc-500 mt-1 italic">&ldquo;{d.note}&rdquo;</p>}
                      <p className="text-[10px] font-light text-zinc-700 mt-1">{new Date(d.date).toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {sub === "withdrawals" && (
          <motion.div key="wd" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {!user.withdrawals.length ? (
              <div className="text-center py-16 border border-dashed border-white/[0.07] rounded-2xl">
                <ArrowUpFromLine className="w-5 h-5 text-zinc-700 mx-auto mb-3" />
                <p className="text-[13px] font-light text-zinc-500">No withdrawals yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04] border-y border-white/[0.04]">
                {[...user.withdrawals].reverse().map((w, i) => (
                  <motion.div key={w.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="py-4 flex items-start gap-4"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-500/[0.08] border border-purple-500/15 flex items-center justify-center shrink-0">
                      <ArrowUpFromLine className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1.5 flex-wrap">
                        <p className="text-[14px] font-normal text-zinc-100 font-mono">
                          {w.amount} <span className="text-zinc-500">{w.coin}</span>
                        </p>
                        <Badge status={w.status} />
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-light text-zinc-600 font-mono truncate flex-1">→ {w.address}</p>
                        <CopyChip value={w.address} />
                      </div>
                      {w.note && <p className="text-[11px] font-light text-zinc-500 mt-1 italic">&ldquo;{w.note}&rdquo;</p>}
                      <p className="text-[10px] font-light text-zinc-700 mt-1.5">{new Date(w.requestDate).toLocaleString()}</p>
                      <button
                        onClick={() => onOpenReceipt({
                          ref: "WX-" + w.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase(),
                          dateLabel: new Date(w.requestDate).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
                          coin: w.coin, amount: w.amount, destination: w.address, status: w.status,
                        })}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-[12px] font-normal text-zinc-300 hover:text-white transition-all active:scale-[0.99]"
                      >
                        <ReceiptIcon className="w-4 h-4" /> View receipt
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   MARKETS CONTENT — live prices
════════════════════════════════════════ */
function MarketsContent() {
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [updated, setUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMarkets = useCallback(async () => {
    try {
      const r = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h"
      );
      if (!r.ok) throw new Error();
      const d: MarketCoin[] = await r.json();
      setCoins(d);
      setStatus("ok");
      setUpdated(new Date());
    } catch {
      setStatus((s) => (s === "ok" ? "ok" : "error"));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
    const id = setInterval(fetchMarkets, 60000);
    return () => clearInterval(id);
  }, [fetchMarkets]);

  const suggested = [...coins]
    .filter((c) => (c.price_change_percentage_24h ?? 0) > 0)
    .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0))
    .slice(0, 3);

  return (
    <motion.div key="markets" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-normal tracking-[0.18em] text-zinc-600 uppercase mb-1">Live markets</p>
          <p className="text-[12px] font-light text-zinc-500 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status === "ok" ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
            {status === "ok" && updated
              ? `Updated ${updated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
              : status === "loading" ? "Fetching live prices…" : "Live price feed"}
          </p>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchMarkets(); }}
          className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-[58px] rounded-xl bg-[#0e0e10] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="text-center py-16 border border-dashed border-white/[0.07] rounded-2xl">
          <AlertCircle className="w-5 h-5 text-zinc-600 mx-auto mb-3" />
          <p className="text-[13px] font-light text-zinc-400 mb-1">Couldn&apos;t load live prices</p>
          <p className="text-[11px] font-light text-zinc-600 mb-5">Check your connection and try again.</p>
          <button onClick={() => { setStatus("loading"); fetchMarkets(); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-[12px] font-normal rounded-lg hover:bg-white/[0.08] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* OK */}
      {status === "ok" && (
        <>
          {/* Suggested */}
          {suggested.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-[12px] font-normal text-zinc-300">Suggested for you</p>
                <span className="text-[9px] font-normal tracking-wider uppercase text-blue-400/70 bg-blue-500/[0.08] border border-blue-500/15 rounded px-1.5 py-0.5">Trending</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {suggested.map((c) => {
                  const chg = c.price_change_percentage_24h ?? 0;
                  return (
                    <div key={c.id} className="bg-[#0e0e10] border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center gap-2.5 mb-3.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.image} alt={c.name} className="w-7 h-7 rounded-full" />
                        <div className="min-w-0">
                          <p className="text-[12px] font-normal text-zinc-100 truncate">{c.name}</p>
                          <p className="text-[10px] font-light text-zinc-600 uppercase">{c.symbol}</p>
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[14px] font-light text-white font-mono">{fmtUsd(c.current_price)}</p>
                          <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                            <TrendingUp className="w-3 h-3" /> {chg.toFixed(2)}%
                          </p>
                        </div>
                        <Sparkline data={c.sparkline_in_7d?.price || []} positive={chg >= 0} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] font-light text-zinc-700 mt-2.5 leading-relaxed">
                Highlighted by 24-hour momentum. This is not financial advice — always do your own research.
              </p>
            </div>
          )}

          {/* All markets */}
          <p className="text-[10px] font-normal tracking-[0.18em] text-zinc-600 uppercase mb-3">All markets</p>
          <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_1.3fr_1fr] gap-4 px-3 pb-2.5 border-b border-white/[0.05]">
            <span className="text-[10px] font-normal tracking-widest uppercase text-zinc-600">Asset</span>
            <span className="text-[10px] font-normal tracking-widest uppercase text-zinc-600 text-right">Price</span>
            <span className="text-[10px] font-normal tracking-widest uppercase text-zinc-600 text-right">24h</span>
            <span className="text-[10px] font-normal tracking-widest uppercase text-zinc-600 text-right">Market cap</span>
            <span className="text-[10px] font-normal tracking-widest uppercase text-zinc-600 text-right">7d trend</span>
          </div>
          <div className="divide-y divide-white/[0.04] border-y border-white/[0.04] md:border-t-0">
            {coins.map((c, i) => {
              const chg = c.price_change_percentage_24h ?? 0;
              const up = chg >= 0;
              return (
                <motion.div key={c.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.35) }}
                  className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1.2fr_1fr_1.3fr_1fr] gap-4 items-center px-3 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-zinc-700 w-4 shrink-0 text-right">{i + 1}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt={c.name} className="w-7 h-7 rounded-full shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-normal text-zinc-100 truncate">{c.name}</p>
                      <p className="text-[10px] font-light text-zinc-600 uppercase">{c.symbol}</p>
                    </div>
                  </div>
                  {/* Mobile combined price + change */}
                  <div className="md:hidden text-right">
                    <p className="text-[13px] font-light text-white font-mono">{fmtUsd(c.current_price)}</p>
                    <p className={`text-[11px] font-mono ${up ? "text-emerald-400" : "text-red-400"}`}>
                      {up ? "▲" : "▼"} {Math.abs(chg).toFixed(2)}%
                    </p>
                  </div>
                  {/* Desktop columns */}
                  <p className="hidden md:block text-[13px] font-light text-white font-mono text-right">{fmtUsd(c.current_price)}</p>
                  <p className={`hidden md:block text-[12px] font-mono text-right ${up ? "text-emerald-400" : "text-red-400"}`}>
                    {up ? "+" : ""}{chg.toFixed(2)}%
                  </p>
                  <p className="hidden md:block text-[12px] font-light text-zinc-400 font-mono text-right">{fmtCompact(c.market_cap)}</p>
                  <div className="hidden md:flex justify-end">
                    <Sparkline data={c.sparkline_in_7d?.price || []} positive={up} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-zinc-700">
            <ShieldCheck className="w-3 h-3" />
            <p className="text-[10px] font-light tracking-wide">Live data via CoinGecko · refreshed every 60 seconds</p>
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ════════════════════════════════════════
   SETTINGS OVERLAY
════════════════════════════════════════ */
function SettingToggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)}
      className={`w-9 h-5 rounded-full relative shrink-0 transition-colors ${on ? "bg-blue-600" : "bg-white/[0.1]"}`}>
      <motion.span layout transition={{ type: "spring", damping: 24, stiffness: 340 }}
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white ${on ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

function SettingRow({ Icon, label, desc, control }: {
  Icon: React.ComponentType<{ className?: string }>; label: string; desc?: string; control: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-normal text-zinc-200">{label}</p>
        {desc && <p className="text-[11px] font-light text-zinc-600 mt-0.5 truncate">{desc}</p>}
      </div>
      {control}
    </div>
  );
}

function SettingsOverlay({ user, onClose, onLogout, balanceHidden, onToggleBalance }: {
  user: UserData; onClose: () => void; onLogout: () => void;
  balanceHidden: boolean; onToggleBalance: () => void;
}) {
  const [biometric, setBiometric] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  const [pinOpen, setPinOpen] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [pinOk, setPinOk] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);

  useEffect(() => {
    try {
      setBiometric(!!localStorage.getItem("vaultx_bio_" + user.id));
      setEmailUpdates(localStorage.getItem("vaultx_pref_email") !== "0");
      setPriceAlerts(localStorage.getItem("vaultx_pref_price") === "1");
      setLoginAlerts(localStorage.getItem("vaultx_pref_login") !== "0");
    } catch { /* ignore */ }
  }, [user.id]);

  function persist(key: string, set: (v: boolean) => void) {
    return (v: boolean) => {
      set(v);
      try { localStorage.setItem(key, v ? "1" : "0"); } catch { /* ignore */ }
    };
  }

  async function toggleBiometric(on: boolean) {
    if (bioBusy) return;
    if (on) {
      setBioBusy(true);
      const ok = await enrollBiometric(user.id, user.name);
      setBioBusy(false);
      setBiometric(ok);
    } else {
      try { localStorage.removeItem("vaultx_bio_" + user.id); } catch { /* ignore */ }
      setBiometric(false);
    }
  }

  async function savePin() {
    setPinOk(false);
    if (!/^\d{6}$/.test(newPin)) { setPinMsg("PIN must be exactly 6 digits"); return; }
    if (newPin !== confirmPin) { setPinMsg("The two PINs don't match"); return; }
    setPinBusy(true); setPinMsg("");
    try {
      const r = await fetch("/api/auth/pin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set", pin: newPin }),
      });
      if (r.ok) {
        setPinOk(true); setPinMsg("PIN updated");
        setNewPin(""); setConfirmPin("");
        setTimeout(() => { setPinOpen(false); setPinMsg(""); setPinOk(false); }, 1300);
      } else setPinMsg("Couldn't update PIN");
    } catch { setPinMsg("Network error"); }
    finally { setPinBusy(false); }
  }

  const pinInputCls = "w-full px-3.5 py-2.5 bg-[#0c0c0d] border border-white/[0.08] rounded-lg text-white text-[14px] tracking-[0.3em] font-mono placeholder-zinc-700 focus:outline-none focus:border-blue-500/40 transition-colors";

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[50] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="fixed inset-x-0 bottom-0 z-[60] bg-[#101012] border-t border-white/[0.06] rounded-t-3xl flex flex-col md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:rounded-3xl md:border md:max-w-md md:w-full"
        style={{ maxHeight: "92vh" }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0 md:hidden">
          <div className="w-9 h-1 rounded-full bg-white/[0.1]" />
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-zinc-400" />
            <p className="text-[15px] font-normal text-white">Settings</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Profile */}
          <div className="flex items-center gap-3.5 pb-5 border-b border-white/[0.05]">
            <div className="w-14 h-14 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-[20px] font-light text-blue-400 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-[15px] font-normal text-white truncate">{user.name}</p>
                <BadgeCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              </div>
              <p className="text-[12px] font-light text-zinc-500 truncate">{user.email}</p>
              <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded bg-emerald-400/[0.08] border border-emerald-400/15 text-[9px] font-normal text-emerald-400 uppercase tracking-wider">
                Verified account
              </span>
            </div>
          </div>

          <p className="text-[10px] font-normal tracking-[0.16em] text-zinc-600 uppercase mt-5 mb-1">Account</p>
          <div className="divide-y divide-white/[0.04]">
            <SettingRow Icon={Fingerprint} label="Account ID" desc={user.id} control={<CopyChip value={user.id} />} />
            <SettingRow Icon={ShieldCheck} label="Verification" desc="Identity confirmed"
              control={<span className="text-[11px] font-light text-emerald-400">Level 2</span>} />
          </div>

          <p className="text-[10px] font-normal tracking-[0.16em] text-zinc-600 uppercase mt-5 mb-1">Privacy &amp; security</p>
          <div className="divide-y divide-white/[0.04]">
            <SettingRow Icon={balanceHidden ? EyeOff : Eye} label="Hide balances" desc="Mask amounts across the dashboard"
              control={<SettingToggle on={balanceHidden} set={() => onToggleBalance()} />} />
            <SettingRow Icon={Fingerprint}
              label="Biometric unlock"
              desc={biometric ? "Face / fingerprint enabled" : "Unlock with Face ID or fingerprint"}
              control={bioBusy
                ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                : <SettingToggle on={biometric} set={toggleBiometric} />} />
          </div>

          {/* Change PIN */}
          <button onClick={() => { setPinOpen((o) => !o); setPinMsg(""); setPinOk(false); }}
            className="w-full flex items-center gap-3 py-3.5 mt-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
              <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-normal text-zinc-200">Change security PIN</p>
              <p className="text-[11px] font-light text-zinc-600 mt-0.5">Your 6-digit dashboard PIN</p>
            </div>
            <span className="text-[11px] font-light text-blue-400">{pinOpen ? "Close" : "Change"}</span>
          </button>
          <AnimatePresence>
            {pinOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#0c0c0d] border border-white/[0.06] rounded-xl p-4 mb-1 space-y-2.5">
                  <input type="password" inputMode="numeric" maxLength={6} placeholder="New 6-digit PIN"
                    value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} className={pinInputCls} />
                  <input type="password" inputMode="numeric" maxLength={6} placeholder="Confirm new PIN"
                    value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} className={pinInputCls} />
                  {pinMsg && (
                    <p className={`text-[11px] font-light ${pinOk ? "text-emerald-400" : "text-red-400"}`}>{pinMsg}</p>
                  )}
                  <button onClick={savePin} disabled={pinBusy}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[12px] font-normal rounded-lg transition-colors">
                    {pinBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    Update PIN
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[10px] font-normal tracking-[0.16em] text-zinc-600 uppercase mt-5 mb-1">Notifications</p>
          <div className="divide-y divide-white/[0.04]">
            <SettingRow Icon={Mail} label="Email updates" desc="Deposits, withdrawals & earnings"
              control={<SettingToggle on={emailUpdates} set={persist("vaultx_pref_email", setEmailUpdates)} />} />
            <SettingRow Icon={TrendingUp} label="Price alerts" desc="Market movement notifications"
              control={<SettingToggle on={priceAlerts} set={persist("vaultx_pref_price", setPriceAlerts)} />} />
            <SettingRow Icon={Bell} label="Login alerts" desc="Notify on a new device sign-in"
              control={<SettingToggle on={loginAlerts} set={persist("vaultx_pref_login", setLoginAlerts)} />} />
          </div>

          <button onClick={onLogout}
            className="w-full mt-7 flex items-center justify-center gap-2 py-3 bg-red-500/[0.07] border border-red-500/20 text-red-400 text-[13px] font-normal rounded-xl hover:bg-red-500/[0.12] transition-colors active:scale-[0.98]">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
          <p className="text-[10px] font-light text-zinc-700 text-center mt-4">VaultX · Session encrypted end-to-end</p>
        </div>
      </motion.div>
    </>
  );
}

/* ════════════════════════════════════════
   WEBAUTHN BIOMETRIC HELPERS
════════════════════════════════════════ */
function bufToB64(b: ArrayBuffer) {
  const bytes = new Uint8Array(b);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function b64ToBuf(s: string) {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}
function biometricSupported() {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}
async function enrollBiometric(userId: string, name: string): Promise<boolean> {
  if (!biometricSupported()) return false;
  try {
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "VaultX" },
        user: { id: new TextEncoder().encode(userId), name, displayName: name },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;
    if (!cred) return false;
    localStorage.setItem("vaultx_bio_" + userId, bufToB64(cred.rawId));
    return true;
  } catch {
    return false;
  }
}
async function verifyBiometric(userId: string): Promise<boolean> {
  if (!biometricSupported()) return false;
  const stored = localStorage.getItem("vaultx_bio_" + userId);
  if (!stored) return false;
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ id: b64ToBuf(stored), type: "public-key" }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}

/* ════════════════════════════════════════
   SECURITY GATE — PIN + biometric
════════════════════════════════════════ */
type GatePhase = "create-enter" | "create-confirm" | "create-bio" | "unlock";

function PinDots({ count, error }: { count: number; error: boolean }) {
  return (
    <motion.div animate={error ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
      className="flex gap-3.5 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i}
          className={`w-3 h-3 rounded-full border transition-all duration-150 ${
            error ? "border-red-500/50"
              : i < count ? "bg-blue-500 border-blue-500 scale-110" : "border-white/15"
          }`} />
      ))}
    </motion.div>
  );
}

/* ─── PIN / biometric verification (used to authorize withdrawals) ─── */
function VerifyPin({ user, title, onVerified, onCancel }: {
  user: UserData; title: string; onVerified: () => void; onCancel: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bioEnrolled = typeof window !== "undefined" && !!localStorage.getItem("vaultx_bio_" + user.id);

  const verify = useCallback(async (value: string) => {
    setBusy(true);
    try {
      const r = await fetch("/api/auth/pin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", pin: value }),
      });
      setBusy(false);
      if (!r.ok) {
        setError("Incorrect PIN");
        setShake(true); setTimeout(() => setShake(false), 450);
        setTimeout(() => setPin(""), 500);
        return;
      }
      onVerified();
    } catch {
      setBusy(false);
      setError("Network error"); setTimeout(() => setPin(""), 500);
    }
  }, [onVerified]);

  function onPinInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (busy) return;
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setError("");
    setPin(v);
    if (v.length === 6) verify(v);
  }

  async function bioVerify() {
    setBusy(true); setError("");
    const ok = await verifyBiometric(user.id);
    setBusy(false);
    if (ok) onVerified();
    else { setError("Biometric failed — use your PIN"); setShake(true); setTimeout(() => setShake(false), 450); }
  }

  return (
    <div className="flex flex-col items-center px-5 pt-8 pb-9">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 16, stiffness: 220 }}
        className="w-12 h-12 rounded-2xl bg-blue-500/[0.1] border border-blue-500/20 flex items-center justify-center mb-4"
      >
        <ShieldCheck className="w-5 h-5 text-blue-400" />
      </motion.div>
      <p className="text-[17px] font-light text-white mb-1">Confirm it&apos;s you</p>
      <p className="text-[12px] font-light text-zinc-500 mb-6 text-center max-w-[260px]">{title}</p>

      <motion.div
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
        className="relative py-3 px-4 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <PinDots count={pin.length} error={!!error} />
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          value={pin}
          onChange={onPinInput}
          maxLength={6}
          aria-label="Security PIN"
          className="absolute inset-0 w-full h-full opacity-0"
          style={{ caretColor: "transparent" }}
        />
      </motion.div>
      <div className="h-5 mt-2 mb-3">
        {error && <p className="text-[11px] font-light text-red-400">{error}</p>}
        {busy && !error && (
          <p className="text-[11px] font-light text-zinc-600 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> Verifying…
          </p>
        )}
      </div>
      <p className="text-[11px] font-light text-zinc-600">Type your 6-digit PIN</p>

      {bioEnrolled && (
        <button onClick={bioVerify} disabled={busy}
          className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white text-[12px] font-normal transition-colors disabled:opacity-50">
          <Fingerprint className="w-4 h-4 text-blue-400" /> Use Face ID / fingerprint
        </button>
      )}

      <button onClick={onCancel}
        className="mt-5 text-[12px] font-light text-zinc-600 hover:text-zinc-300 transition-colors">
        Cancel
      </button>
    </div>
  );
}

function GateScreen({ user, hasPin, onUnlock }: {
  user: UserData; hasPin: boolean; onUnlock: () => void;
}) {
  const [phase, setPhase] = useState<GatePhase>(hasPin ? "unlock" : "create-enter");
  const [pin, setPin] = useState("");
  const [first, setFirst] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bioEnrolled = typeof window !== "undefined" && !!localStorage.getItem("vaultx_bio_" + user.id);

  function finishUnlock() {
    onUnlock();
  }
  function fail(msg: string) {
    setError(msg); setShake(true);
    setTimeout(() => setShake(false), 450);
  }

  const complete = useCallback(async (value: string) => {
    if (phase === "create-enter") {
      setFirst(value);
      setTimeout(() => { setPin(""); setError(""); setPhase("create-confirm"); }, 160);
      return;
    }
    if (phase === "create-confirm") {
      if (value !== first) {
        fail("PINs didn't match — start again");
        setTimeout(() => { setPin(""); setFirst(""); setPhase("create-enter"); }, 850);
        return;
      }
      setBusy(true);
      try {
        const r = await fetch("/api/auth/pin", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "set", pin: value }),
        });
        setBusy(false);
        if (!r.ok) { fail("Couldn't save your PIN"); setTimeout(() => { setPin(""); setFirst(""); setPhase("create-enter"); }, 850); return; }
        setPin("");
        if (biometricSupported()) setPhase("create-bio");
        else finishUnlock();
      } catch {
        setBusy(false);
        fail("Network error"); setTimeout(() => { setPin(""); setFirst(""); setPhase("create-enter"); }, 850);
      }
      return;
    }
    if (phase === "unlock") {
      setBusy(true);
      try {
        const r = await fetch("/api/auth/pin", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify", pin: value }),
        });
        setBusy(false);
        if (!r.ok) { fail("Incorrect PIN"); setTimeout(() => setPin(""), 500); return; }
        finishUnlock();
      } catch {
        setBusy(false);
        fail("Network error"); setTimeout(() => setPin(""), 500);
      }
    }
  }, [phase, first]); // eslint-disable-line react-hooks/exhaustive-deps

  function onPinInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (busy) return;
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setError("");
    setPin(v);
    if (v.length === 6) complete(v);
  }

  // Keep the field focused so typing always lands on the PIN.
  useEffect(() => {
    if (phase !== "create-bio") inputRef.current?.focus();
  }, [phase]);

  async function bioUnlock() {
    setBusy(true); setError("");
    const ok = await verifyBiometric(user.id);
    setBusy(false);
    if (ok) finishUnlock();
    else fail("Biometric check failed — use your PIN");
  }
  async function bioEnroll() {
    setBusy(true);
    const ok = await enrollBiometric(user.id, user.name);
    setBusy(false);
    if (!ok) setError("Couldn't enable biometrics on this device");
    finishUnlock();
  }

  const titles: Record<GatePhase, { t: string; s: string }> = {
    "create-enter":   { t: "Create your security PIN", s: "Choose a 6-digit PIN to protect your vault" },
    "create-confirm": { t: "Confirm your PIN", s: "Re-enter the 6 digits to confirm" },
    "create-bio":     { t: "Enable quick unlock", s: "Use Face ID or fingerprint next time" },
    "unlock":         { t: `Welcome back, ${user.name.split(" ")[0]}`, s: "Enter your 6-digit PIN to continue" },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0b] flex flex-col items-center justify-center px-6 py-10 overflow-y-auto"
    >
      <div className="flex items-center gap-2 mb-auto">
        <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
          <TrendingUp className="w-3 h-3 text-white" />
        </div>
        <span className="font-normal text-white text-[14px]">VaultX</span>
      </div>

      <div className="my-auto w-full max-w-[300px] flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 16, stiffness: 220 }}
          className="w-14 h-14 rounded-2xl bg-blue-500/[0.1] border border-blue-500/20 flex items-center justify-center mb-5"
        >
          {phase === "create-bio"
            ? <ScanFace className="w-6 h-6 text-blue-400" />
            : <Lock className="w-6 h-6 text-blue-400" />}
        </motion.div>

        <h1 className="text-[19px] font-light text-white text-center mb-1.5">{titles[phase].t}</h1>
        <p className="text-[12px] font-light text-zinc-500 text-center mb-7">{titles[phase].s}</p>

        {phase === "create-bio" ? (
          <div className="w-full space-y-2.5">
            <button onClick={bioEnroll} disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-normal rounded-xl transition-colors">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
              Enable Face ID / fingerprint
            </button>
            <button onClick={finishUnlock} disabled={busy}
              className="w-full py-2.5 text-zinc-500 hover:text-zinc-300 text-[12px] font-light transition-colors">
              Not now — continue with PIN
            </button>
          </div>
        ) : (
          <>
            {/* Tap the dots to bring up your keyboard; typing fills the PIN. */}
            <motion.div
              animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
              className="relative py-3 px-4 cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              <PinDots count={pin.length} error={!!error} />
              <input
                ref={inputRef}
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                value={pin}
                onChange={onPinInput}
                maxLength={6}
                aria-label="Security PIN"
                className="absolute inset-0 w-full h-full opacity-0"
                style={{ caretColor: "transparent" }}
              />
            </motion.div>
            <div className="h-5 mt-2 mb-3">
              {error && <p className="text-[11px] font-light text-red-400">{error}</p>}
              {busy && !error && (
                <p className="text-[11px] font-light text-zinc-600 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> Verifying…
                </p>
              )}
            </div>
            <p className="text-[11px] font-light text-zinc-600">Type your 6-digit PIN</p>
            {phase === "unlock" && bioEnrolled && (
              <button onClick={bioUnlock} disabled={busy}
                className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white text-[12px] font-normal transition-colors disabled:opacity-50">
                <Fingerprint className="w-4 h-4 text-blue-400" /> Unlock with Face ID / fingerprint
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5 mt-auto pt-8 text-zinc-700">
        <ShieldCheck className="w-3 h-3" />
        <p className="text-[10px] font-light tracking-wide">Your PIN is encrypted · never stored in plain text</p>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   COIN CALCULATOR
════════════════════════════════════════ */
const CG_ID: Record<CoinKey, string> = {
  BTC: "bitcoin", ETH: "ethereum", USDT: "tether",
  BNB: "binancecoin", SOL: "solana", USDC: "usd-coin",
};
type CalcUnit = CoinKey | "USD";

function CoinCalculator() {
  const [prices, setPrices] = useState<Record<string, number> | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState<CalcUnit>("BTC");
  const [to, setTo] = useState<CalcUnit>("USD");

  const fetchPrices = useCallback(async () => {
    setStatus("loading");
    try {
      const ids = Object.values(CG_ID).join(",");
      const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
      if (!r.ok) throw new Error();
      const d = await r.json();
      const map: Record<string, number> = { USD: 1 };
      (Object.keys(CG_ID) as CoinKey[]).forEach((c) => { map[c] = d[CG_ID[c]]?.usd ?? 0; });
      setPrices(map);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const units: CalcUnit[] = [...COINS, "USD"];
  const amt = parseFloat(amount) || 0;
  const result = prices && prices[from] && prices[to]
    ? (amt * prices[from]) / prices[to]
    : 0;

  return (
    <div className="bg-[#0e0e10] border border-white/[0.06] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-3.5 h-3.5 text-blue-400" />
        <p className="text-[12px] font-normal text-zinc-200">Coin calculator</p>
        {status === "ok" && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      </div>

      {status === "error" ? (
        <div className="text-center py-6">
          <p className="text-[12px] font-light text-zinc-500 mb-3">Couldn&apos;t load live prices</p>
          <button onClick={fetchPrices}
            className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* From */}
          <div className="bg-[#0c0c0d] border border-white/[0.07] rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-light text-zinc-600 uppercase tracking-wider">From</span>
              <select value={from} onChange={(e) => setFrom(e.target.value as CalcUnit)}
                className="bg-transparent text-[12px] font-normal text-zinc-200 focus:outline-none cursor-pointer">
                {units.map((u) => <option key={u} value={u} className="bg-[#0c0c0d]">{u}</option>)}
              </select>
            </div>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-[22px] font-light text-white placeholder-zinc-700 focus:outline-none [appearance:textfield]" />
          </div>

          {/* Swap */}
          <div className="flex justify-center -my-1 relative z-10">
            <button onClick={() => { setFrom(to); setTo(from); }}
              className="w-7 h-7 rounded-lg bg-[#1a1a1e] border border-white/[0.1] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-colors">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* To */}
          <div className="bg-[#0c0c0d] border border-white/[0.07] rounded-lg p-3 mt-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-light text-zinc-600 uppercase tracking-wider">To</span>
              <select value={to} onChange={(e) => setTo(e.target.value as CalcUnit)}
                className="bg-transparent text-[12px] font-normal text-zinc-200 focus:outline-none cursor-pointer">
                {units.map((u) => <option key={u} value={u} className="bg-[#0c0c0d]">{u}</option>)}
              </select>
            </div>
            <p className="text-[22px] font-light text-white font-mono truncate">
              {status === "loading" ? "…" : result.toLocaleString("en-US", { maximumFractionDigits: to === "USD" ? 2 : 8 })}
            </p>
          </div>

          {prices && status === "ok" && (
            <p className="text-[10px] font-light text-zinc-600 mt-3 text-center">
              1 {from} = {((prices[from] || 0) / (prices[to] || 1)).toLocaleString("en-US", { maximumFractionDigits: to === "USD" ? 2 : 8 })} {to}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   CRYPTO NEWS
════════════════════════════════════════ */
interface NewsArticle {
  id: string; title: string; url: string; imageurl: string;
  source: string; published_on: number;
}

function timeAgo(unixSec: number) {
  const diff = Date.now() / 1000 - unixSec;
  if (diff < 3600) return Math.max(1, Math.floor(diff / 60)) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

function CryptoNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  const fetchNews = useCallback(async () => {
    setStatus("loading");
    try {
      const r = await fetch("/api/news");
      if (!r.ok) throw new Error();
      const d = await r.json();
      const items: NewsArticle[] = d.articles || [];
      if (!items.length) throw new Error();
      setNews(items);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-3.5 h-3.5 text-blue-400" />
        <p className="text-[12px] font-normal text-zinc-200">Crypto news</p>
        <button onClick={fetchNews} className="ml-auto text-zinc-600 hover:text-zinc-300 transition-colors">
          <RefreshCw className={`w-3 h-3 ${status === "loading" ? "animate-spin" : ""}`} />
        </button>
      </div>

      {status === "loading" && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-lg bg-[#0e0e10] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="text-center py-8 border border-dashed border-white/[0.07] rounded-lg">
          <p className="text-[12px] font-light text-zinc-500 mb-2">Couldn&apos;t load news</p>
          <button onClick={fetchNews} className="text-[11px] text-blue-400 hover:underline">Retry</button>
        </div>
      )}

      {status === "ok" && (
        <div className="space-y-2">
          {news.map((a) => (
            <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
              className="flex gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.imageurl} alt="" loading="lazy"
                className="w-16 h-16 rounded-lg object-cover bg-[#0e0e10] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-normal text-zinc-200 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                  {a.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] font-light text-blue-400/80 truncate">{a.source}</span>
                  <span className="text-[10px] font-light text-zinc-700">·</span>
                  <span className="text-[10px] font-light text-zinc-600">{timeAgo(a.published_on)}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-zinc-700 ml-auto shrink-0" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   TOOLS DRAWER — calculator + news
════════════════════════════════════════ */
function ToolsDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-[380px] bg-[#0c0c0d] border-l border-white/[0.06] flex flex-col"
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-zinc-400" />
            <p className="text-[14px] font-normal text-white">Coin calculator</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <CoinCalculator />
          <p className="text-[10px] font-light text-zinc-700 text-center mt-5 leading-relaxed">
            Live rates via CoinGecko. For headlines, open the News tab.
          </p>
        </div>
      </motion.aside>
    </>
  );
}

/* ════════════════════════════════════════
   WITHDRAWAL RECEIPT
════════════════════════════════════════ */
interface ReceiptData {
  ref: string;
  dateLabel: string;
  coin: CoinKey;
  amount: string | number;
  destination: string;
  status: string;
}

const RECEIPT_STATUS: Record<string, { label: string; color: string }> = {
  pending:    { label: "Pending review", color: "#fbbf24" },
  processing: { label: "Processing",     color: "#60a5fa" },
  completed:  { label: "Completed",      color: "#34d399" },
  rejected:   { label: "Rejected",       color: "#f87171" },
};

function shortAddr(a: string) {
  return a.length > 22 ? `${a.slice(0, 12)}…${a.slice(-6)}` : a;
}

function ReceiptCard({ data }: { data: ReceiptData }) {
  const st = RECEIPT_STATUS[data.status] || RECEIPT_STATUS.pending;
  const pending = data.status === "pending" || data.status === "processing";
  return (
    <div className="relative w-full bg-[#0c0c0d] border border-white/[0.08] rounded-t-xl">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center">
              <TrendingUp className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-[12px] font-normal text-white">VaultX</span>
          </div>
          <span className="text-[9px] font-normal tracking-[0.18em] text-zinc-600 uppercase">Receipt</span>
        </div>
        <p className="text-[10px] font-light text-zinc-600">Digital withdrawal confirmation</p>
      </div>

      <div className="border-t border-dashed border-white/[0.12] mx-3" />

      <div className="px-5 py-4 space-y-2.5">
        {([
          ["Reference", data.ref],
          ["Date", data.dateLabel],
          ["Asset", `${COIN_NAME[data.coin]} (${data.coin})`],
          ["Amount", `${data.amount} ${data.coin}`],
          ["Destination", shortAddr(data.destination)],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-light text-zinc-600 uppercase tracking-wider">{k}</span>
            <span className="text-[11px] font-mono text-zinc-200 text-right">{v}</span>
          </div>
        ))}
        <div className="border-t border-dashed border-white/[0.08] my-1" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-light text-zinc-600 uppercase tracking-wider">Status</span>
          <span className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: st.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.color }} /> {st.label}
          </span>
        </div>
        {pending && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-light text-zinc-600 uppercase tracking-wider">Est. arrival</span>
            <span className="text-[11px] font-mono text-zinc-200">24–48 hours</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-light text-zinc-600 uppercase tracking-wider">Network fee</span>
          <span className="text-[11px] font-mono text-emerald-400">Covered</span>
        </div>
      </div>

      <div className="border-t border-dashed border-white/[0.12] mx-3" />

      <div className="px-5 py-4 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3 h-3 text-emerald-400/70" />
        <p className="text-[9px] font-light text-zinc-600 tracking-wide">Secured &amp; encrypted by VaultX</p>
      </div>

      <div className="absolute left-0 right-0 -bottom-[6px] flex justify-around px-1">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-[#101012]" />
        ))}
      </div>
    </div>
  );
}

/** Render the receipt to a PNG and download it. */
function downloadReceipt(data: ReceiptData) {
  const st = RECEIPT_STATUS[data.status] || RECEIPT_STATUS.pending;
  const W = 560, pad = 48;
  const rows: [string, string][] = [
    ["REFERENCE", data.ref],
    ["DATE", data.dateLabel],
    ["ASSET", `${COIN_NAME[data.coin]} (${data.coin})`],
    ["AMOUNT", `${data.amount} ${data.coin}`],
    ["DESTINATION", data.destination.length > 32
      ? `${data.destination.slice(0, 18)}…${data.destination.slice(-10)}`
      : data.destination],
    ["NETWORK FEE", "Covered by VaultX"],
  ];
  const H = 130 + rows.length * 52 + 150;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#0c0c0d";
  ctx.fillRect(0, 0, W, H);

  const dline = (y: number) => {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1; ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    ctx.restore();
  };

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 24px Arial";
  ctx.fillText("VaultX", pad, 64);
  ctx.fillStyle = "#71717a";
  ctx.font = "11px Arial";
  const tag = "WITHDRAWAL RECEIPT";
  ctx.fillText(tag, W - pad - ctx.measureText(tag).width, 58);

  dline(96);

  let y = 142;
  rows.forEach(([k, v]) => {
    ctx.fillStyle = "#71717a"; ctx.font = "11px Arial";
    ctx.fillText(k, pad, y);
    ctx.fillStyle = "#e4e4e7"; ctx.font = "15px monospace";
    ctx.textAlign = "right";
    ctx.fillText(v, W - pad, y);
    ctx.textAlign = "left";
    y += 52;
  });

  dline(y - 20);
  ctx.fillStyle = "#71717a"; ctx.font = "11px Arial";
  ctx.fillText("STATUS", pad, y + 16);
  ctx.fillStyle = st.color; ctx.font = "15px monospace";
  ctx.textAlign = "right";
  ctx.fillText(st.label, W - pad, y + 16);
  ctx.textAlign = "left";
  y += 52;

  dline(y - 20);
  ctx.fillStyle = "#52525b"; ctx.font = "11px Arial";
  const f1 = "Secured & encrypted by VaultX";
  ctx.fillText(f1, (W - ctx.measureText(f1).width) / 2, y + 14);
  ctx.fillStyle = "#3f3f46"; ctx.font = "10px Arial";
  const f2 = "Keep this receipt for your records";
  ctx.fillText(f2, (W - ctx.measureText(f2).width) / 2, y + 32);

  const a = document.createElement("a");
  a.href = c.toDataURL("image/png");
  a.download = `VaultX-Receipt-${data.ref}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function ReceiptModal({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[50] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="fixed inset-x-0 bottom-0 z-[60] bg-[#101012] border-t border-white/[0.06] rounded-t-3xl flex flex-col md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:rounded-3xl md:border md:max-w-md md:w-full"
        style={{ maxHeight: "92vh" }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0 md:hidden">
          <div className="w-9 h-1 rounded-full bg-white/[0.1]" />
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] shrink-0">
          <div className="flex items-center gap-2">
            <ReceiptIcon className="w-4 h-4 text-zinc-400" />
            <p className="text-[15px] font-normal text-white">Withdrawal receipt</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <ReceiptCard data={data} />
          <button onClick={() => downloadReceipt(data)}
            className="w-full mt-8 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-xl transition-colors active:scale-[0.98]">
            <Download className="w-4 h-4" /> Save receipt
          </button>
        </div>
      </motion.div>
    </>
  );
}

/* ════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════ */
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [tab, setTab] = useState<Tab>("portfolio");
  const [activitySub, setActivitySub] = useState<"deposits" | "withdrawals">("deposits");
  const [loading, setLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [locked, setLocked] = useState(true);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [balanceHidden, setBalanceHidden] = useState(false);

  useEffect(() => {
    try { setBalanceHidden(localStorage.getItem("vaultx_hide_balance") === "1"); } catch { /* ignore */ }
  }, []);

  function toggleBalanceHidden() {
    setBalanceHidden((h) => {
      const next = !h;
      try { localStorage.setItem("vaultx_hide_balance", next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }

  const load = useCallback(async () => {
    const [me, cfg] = await Promise.all([fetch("/api/auth/me"), fetch("/api/settings")]);
    const meData = await me.json();
    const u = meData.user;
    if (!u) { router.push("/login"); return; }
    if (u.role === "admin") { router.push("/admin"); return; }
    setUser(u);
    setHasPin(!!meData.hasPin);
    if (cfg.ok) {
      const data = await cfg.json();
      setSettings(data.settings);
    }
    setLoading(false);
  }, [router]);

  // Initial load + live refresh so admin balance changes show up automatically.
  useEffect(() => {
    load();
    const id = setInterval(load, 25000);
    return () => clearInterval(id);
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const lockStatus = (() => {
    if (!user || !settings) return null;
    if (settings.globalWithdrawalLock)
      return { locked: true, reason: settings.globalWithdrawalLockReason || "Withdrawals temporarily disabled." };
    if (user.customLock) return { locked: true, reason: "Your account withdrawals are locked." };
    if (user.withdrawalUnlockDate) {
      const d = new Date(user.withdrawalUnlockDate);
      if (d > new Date()) return { locked: true, reason: `Withdrawals unlock on ${d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.` };
    }
    return { locked: false, reason: null };
  })();

  const totalEarnings = COINS.reduce((s, c) => s + (user?.earnings[c] || 0), 0);
  const activeCoins = COINS.filter(c => (user?.balance[c] || 0) + (user?.earnings[c] || 0) > 0);
  const hasAnyBalance = activeCoins.length > 0;

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-blue-400" />
        </div>
        <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
      </div>
    </div>
  );

  const navItems = [
    { id: "portfolio" as Tab, label: "Portfolio", Icon: TrendingUp },
    { id: "markets"   as Tab, label: "Markets",   Icon: LineChart },
    { id: "news"      as Tab, label: "News",      Icon: Newspaper },
    { id: "activity"  as Tab, label: "Activity",  Icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">

      {/* ═══════════ DESKTOP SIDEBAR ═══════════ */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-[#0c0c0d] border-r border-white/[0.05] z-30">
        {/* Logo */}
        <div className="px-5 h-16 flex items-center border-b border-white/[0.04]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-normal text-white text-[15px] tracking-tight">VaultX</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5">
          <p className="px-3 text-[10px] font-normal tracking-[0.18em] text-zinc-700 uppercase mb-2">Menu</p>
          <div className="space-y-1">
            {navItems.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-light transition-colors ${
                  tab === id ? "bg-white/[0.05] text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
                }`}
              >
                {tab === id && <motion.div layoutId="sideNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-blue-500" />}
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Quick actions */}
          <p className="px-3 text-[10px] font-normal tracking-[0.18em] text-zinc-700 uppercase mb-2 mt-7">Quick actions</p>
          <div className="space-y-2 px-1">
            <button onClick={() => setDepositOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-normal rounded-lg transition-colors active:scale-[0.98]">
              <ArrowDownToLine className="w-3.5 h-3.5" /> Deposit funds
            </button>
            <button onClick={() => setWithdrawOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 text-[12px] font-normal rounded-lg transition-colors active:scale-[0.98]">
              <ArrowUpFromLine className="w-3.5 h-3.5" /> Withdraw
            </button>
            <button onClick={() => setToolsOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-300 text-[12px] font-normal rounded-lg transition-colors active:scale-[0.98]">
              <Calculator className="w-3.5 h-3.5" /> Coin calculator
            </button>
          </div>
        </nav>

        {/* Account */}
        <div className="p-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-1">
            <button onClick={() => setSettingsOpen(true)}
              className="flex-1 flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-[13px] font-normal text-blue-400 shrink-0">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[12px] font-normal text-zinc-200 truncate">{user?.name}</p>
                <p className="text-[10px] font-light text-zinc-600 truncate">View profile &amp; settings</p>
              </div>
              <SettingsIcon className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            </button>
            <button onClick={logout} title="Sign out"
              className="w-8 h-8 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-400/[0.05] flex items-center justify-center transition-colors shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-2 mt-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400/70 shrink-0" />
            <span className="text-[10px] font-light text-zinc-600">Secure encrypted session</span>
          </div>
        </div>
      </aside>

      {/* ═══════════ MOBILE TOP BAR ═══════════ */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <span className="font-normal text-white text-[14px]">VaultX</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setToolsOpen(true)} title="Tools & News"
              className="w-7 h-7 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-500 hover:text-zinc-200 flex items-center justify-center transition-colors">
              <Calculator className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setSettingsOpen(true)} title="Profile & settings"
              className="w-7 h-7 rounded-full bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-[11px] font-normal text-blue-400 hover:border-blue-500/45 transition-colors">
              {user?.name.charAt(0).toUpperCase()}
            </button>
            <button onClick={logout}
              className="w-7 h-7 rounded-md text-zinc-600 hover:text-red-400 flex items-center justify-center transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════ MAIN ═══════════ */}
      <main className="md:pl-64 pb-24 md:pb-12">
        <div className="max-w-3xl mx-auto px-5 md:px-10 pt-8 md:pt-10">

          {/* Page header */}
          <div className="flex items-end justify-between gap-4 mb-8 md:mb-9">
            <div>
              <p className="text-[13px] font-light text-zinc-500">{getGreeting()},</p>
              <h1 className="text-[26px] md:text-[30px] font-light text-white leading-tight tracking-tight mt-0.5">
                {user?.name?.split(" ")[0]}
              </h1>
            </div>
            <p className="hidden md:block text-[11px] font-light text-zinc-600 pb-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Stacked balance card — directly under the name */}
          {tab === "portfolio" && user && (
            <BalanceStack user={user} activeCoins={activeCoins} locked={!!lockStatus?.locked}
              hidden={balanceHidden} onToggleHidden={toggleBalanceHidden} />
          )}

          {/* Mobile quick actions (desktop has them in sidebar) */}
          {tab === "portfolio" && (
            <div className="md:hidden grid grid-cols-2 gap-3 mb-7">
              <button onClick={() => setDepositOpen(true)}
                className="flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-xl transition-colors active:scale-[0.98]">
                <ArrowDownToLine className="w-4 h-4" /> Deposit
              </button>
              <button onClick={() => setWithdrawOpen(true)}
                className="flex items-center justify-center gap-2 py-3.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 text-[13px] font-normal rounded-xl transition-colors active:scale-[0.98]">
                <ArrowUpFromLine className="w-4 h-4" /> Withdraw
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {tab === "portfolio" && user && (
              <PortfolioContent
                key="portfolio"
                user={user} activeCoins={activeCoins}
                hasAnyBalance={hasAnyBalance} lockStatus={lockStatus}
                hidden={balanceHidden}
                onDeposit={() => setDepositOpen(true)}
              />
            )}
            {tab === "markets" && (
              <MarketsContent key="markets" />
            )}
            {tab === "news" && (
              <motion.div key="news" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <CryptoNews />
              </motion.div>
            )}
            {tab === "activity" && user && (
              <ActivityContent key="activity" user={user} sub={activitySub} setSub={setActivitySub}
                onOpenReceipt={(d) => setReceipt(d)} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ═══════════ MOBILE BOTTOM NAV ═══════════ */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0c0c0d]/95 backdrop-blur-xl border-t border-white/[0.06] pb-safe">
        <div className="flex items-stretch">
          {navItems.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 pt-2.5 pb-3 relative transition-colors ${
                tab === id ? "text-blue-400" : "text-zinc-600"
              }`}
            >
              {tab === id && <motion.div layoutId="botNav" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-blue-500" />}
              <Icon className="w-[18px] h-[18px]" />
              <span className="text-[9px] font-light tracking-wide">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ═══════════ OVERLAYS ═══════════ */}
      <AnimatePresence>
        {depositOpen && user && (
          <DepositOverlay key="deposit" settings={settings}
            onClose={() => setDepositOpen(false)} onSuccess={load} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {withdrawOpen && user && (
          <WithdrawOverlay key="withdraw" user={user}
            onClose={() => setWithdrawOpen(false)} onSuccess={load} lockStatus={lockStatus} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {settingsOpen && user && (
          <SettingsOverlay key="settings" user={user}
            onClose={() => setSettingsOpen(false)} onLogout={logout}
            balanceHidden={balanceHidden} onToggleBalance={toggleBalanceHidden} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toolsOpen && (
          <ToolsDrawer key="tools" onClose={() => setToolsOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {receipt && (
          <ReceiptModal key="receipt" data={receipt} onClose={() => setReceipt(null)} />
        )}
      </AnimatePresence>

      {/* Security gate — PIN / biometric before the dashboard is shown */}
      <AnimatePresence>
        {!loading && locked && user && (
          <GateScreen key="gate" user={user} hasPin={hasPin} onUnlock={() => setLocked(false)} />
        )}
      </AnimatePresence>

      <ChatWidget />
    </div>
  );
}
