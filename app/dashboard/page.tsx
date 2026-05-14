"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  LogOut,
  Copy,
  CheckCheck,
  AlertCircle,
  Loader2,
  LayoutDashboard,
  History,
  ChevronRight,
  Lock,
  Unlock,
  X,
} from "lucide-react";
import type { CoinKey } from "@/lib/db";

const COINS: CoinKey[] = ["BTC", "ETH", "USDT", "BNB", "SOL", "USDC"];
const COIN_COLORS: Record<CoinKey, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  USDT: "#26a17b",
  BNB: "#f0b90b",
  SOL: "#9945ff",
  USDC: "#2775ca",
};
const COIN_LABELS: Record<CoinKey, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether",
  BNB: "BNB",
  SOL: "Solana",
  USDC: "USD Coin",
};

type Tab = "portfolio" | "deposit" | "withdraw" | "history";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  balance: Partial<Record<CoinKey, number>>;
  earnings: Partial<Record<CoinKey, number>>;
  deposits: {
    id: string;
    coin: CoinKey;
    amount: number;
    txHash: string;
    status: string;
    note?: string;
    date: string;
  }[];
  withdrawals: {
    id: string;
    coin: CoinKey;
    amount: number;
    address: string;
    status: string;
    note?: string;
    requestDate: string;
  }[];
  withdrawalUnlockDate: string | null;
  customLock: boolean;
}

interface Settings {
  globalWithdrawalLock: boolean;
  globalWithdrawalLockReason: string;
  defaultWithdrawalLockDays: number;
  adminWallets: Partial<Record<CoinKey, string>>;
  siteName: string;
}

function CoinBadge({ coin }: { coin: CoinKey }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold"
      style={{ backgroundColor: COIN_COLORS[coin] + "22", color: COIN_COLORS[coin] }}
    >
      {coin}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-green-500/15 text-green-400 border-green-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
    processing: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    completed: "bg-green-500/15 text-green-400 border-green-500/30",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        map[status] || "bg-gray-500/15 text-gray-400 border-gray-500/30"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
      title="Copy"
    >
      {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [tab, setTab] = useState<Tab>("portfolio");
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Deposit form
  const [depCoin, setDepCoin] = useState<CoinKey>("BTC");
  const [depAmount, setDepAmount] = useState("");
  const [depTxHash, setDepTxHash] = useState("");
  const [depLoading, setDepLoading] = useState(false);
  const [depMsg, setDepMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Withdraw form
  const [wdCoin, setWdCoin] = useState<CoinKey>("BTC");
  const [wdAmount, setWdAmount] = useState("");
  const [wdAddress, setWdAddress] = useState("");
  const [wdLoading, setWdLoading] = useState(false);
  const [wdMsg, setWdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    const [meRes, settingsRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/admin/settings"),
    ]);
    const meData = await meRes.json();
    if (!meData.user) {
      router.push("/login");
      return;
    }
    if (meData.user.role === "admin") {
      router.push("/admin");
      return;
    }
    setUser(meData.user);
    if (settingsRes.ok) {
      const sData = await settingsRes.json();
      setSettings(sData.settings);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function submitDeposit(e: React.FormEvent) {
    e.preventDefault();
    setDepMsg(null);
    setDepLoading(true);
    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin: depCoin, amount: parseFloat(depAmount), txHash: depTxHash }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDepMsg({ type: "error", text: data.error });
      } else {
        setDepMsg({ type: "success", text: "Deposit submitted! It will be confirmed by our team shortly." });
        setDepAmount("");
        setDepTxHash("");
        fetchData();
      }
    } catch {
      setDepMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setDepLoading(false);
    }
  }

  async function submitWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setWdMsg(null);
    setWdLoading(true);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin: wdCoin, amount: parseFloat(wdAmount), address: wdAddress }),
      });
      const data = await res.json();
      if (!res.ok) {
        setWdMsg({ type: "error", text: data.error });
      } else {
        setWdMsg({ type: "success", text: "Withdrawal request submitted! Processing within 24–48 hours." });
        setWdAmount("");
        setWdAddress("");
        fetchData();
      }
    } catch {
      setWdMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setWdLoading(false);
    }
  }

  const withdrawStatus = () => {
    if (!user || !settings) return null;
    if (settings.globalWithdrawalLock) {
      return { locked: true, reason: settings.globalWithdrawalLockReason || "Withdrawals are temporarily disabled." };
    }
    if (user.customLock) {
      return { locked: true, reason: "Your account withdrawals are locked by the administrator." };
    }
    if (user.withdrawalUnlockDate) {
      const unlock = new Date(user.withdrawalUnlockDate);
      if (unlock > new Date()) {
        return {
          locked: true,
          reason: `Withdrawals unlock on ${unlock.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.`,
        };
      }
    }
    return { locked: false, reason: null };
  };

  const totalBalance = COINS.reduce((sum, c) => {
    return sum + (user?.balance[c] || 0) + (user?.earnings[c] || 0);
  }, 0);

  const navItems: { tab: Tab; label: string; icon: React.ReactNode }[] = [
    { tab: "portfolio", label: "Portfolio", icon: <LayoutDashboard className="w-4 h-4" /> },
    { tab: "deposit", label: "Deposit", icon: <ArrowDownCircle className="w-4 h-4" /> },
    { tab: "withdraw", label: "Withdraw", icon: <ArrowUpCircle className="w-4 h-4" /> },
    { tab: "history", label: "History", icon: <History className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const wdStatus = withdrawStatus();

  return (
    <div className="min-h-screen bg-[#050510] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/3 border-r border-white/8 h-screen sticky top-0">
        <div className="p-6 border-b border-white/8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VaultX
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                tab === item.tab
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
              {tab === item.tab && <ChevronRight className="w-3 h-3 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/8">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white/3 border-b border-white/8 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            VaultX
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-30 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-64 bg-[#0a0a1a] border-r border-white/10 p-4 pt-20"
              initial={{ x: -64 }}
              animate={{ x: 0 }}
              exit={{ x: -64 }}
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => { setTab(item.tab); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      tab === item.tab
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="absolute bottom-6 left-4 right-4">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 mb-3">{user?.email}</p>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-5 md:p-8 overflow-auto">
        {/* Mobile tab nav */}
        <div className="md:hidden flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setTab(item.tab)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === item.tab ? "bg-blue-600 text-white" : "text-gray-400"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ─── PORTFOLIO ─── */}
          {tab === "portfolio" && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Portfolio Overview</h1>
                <p className="text-gray-400 text-sm mt-1">Track your balances and earnings</p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Holdings</p>
                  <p className="text-2xl font-bold text-white">
                    {COINS.some(c => (user?.balance[c] || 0) + (user?.earnings[c] || 0) > 0)
                      ? `${totalBalance.toFixed(6)}`
                      : "—"
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Combined across all coins</p>
                </div>

                <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Deposits</p>
                  <p className="text-2xl font-bold text-white">
                    {user?.deposits.filter(d => d.status === "confirmed").length || 0}
                  </p>
                  <p className="text-xs text-green-400 mt-1">
                    {user?.deposits.filter(d => d.status === "pending").length || 0} pending
                  </p>
                </div>

                <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Withdrawal Status</p>
                  {wdStatus?.locked ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Lock className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm text-yellow-400 font-medium">Locked</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <Unlock className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">Available</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1 truncate">{wdStatus?.reason || "You may withdraw"}</p>
                </div>
              </div>

              {/* Coin balances */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Balances</h2>
              <div className="space-y-3">
                {COINS.map((coin) => {
                  const bal = user?.balance[coin] || 0;
                  const earn = user?.earnings[coin] || 0;
                  const total = bal + earn;
                  if (total === 0 && !user?.deposits.some(d => d.coin === coin)) return null;
                  return (
                    <motion.div
                      key={coin}
                      className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all"
                      whileHover={{ y: -1 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: COIN_COLORS[coin] + "22", color: COIN_COLORS[coin] }}
                          >
                            {coin.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{COIN_LABELS[coin]}</p>
                            <p className="text-xs text-gray-500">{coin}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white">{total.toFixed(6)} {coin}</p>
                          <div className="flex items-center gap-3 justify-end text-xs mt-0.5">
                            <span className="text-gray-500">Principal: {bal.toFixed(6)}</span>
                            <span className="text-green-400">+{earn.toFixed(6)} earned</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {COINS.every(c => (user?.balance[c] || 0) + (user?.earnings[c] || 0) === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No balances yet</p>
                    <p className="text-sm mt-1">Make your first deposit to start earning</p>
                    <button
                      onClick={() => setTab("deposit")}
                      className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium text-white transition-colors"
                    >
                      Make a Deposit
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── DEPOSIT ─── */}
          {tab === "deposit" && (
            <motion.div
              key="deposit"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Deposit Crypto</h1>
                <p className="text-gray-400 text-sm mt-1">Send your crypto to start earning returns</p>
              </div>

              {/* How it works */}
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5 mb-6">
                <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  How to Deposit
                </h3>
                <ol className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">1.</span> Copy the wallet address for your chosen coin below.</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">2.</span> Send your crypto to that address from your personal wallet.</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">3.</span> Submit the transaction hash in the form below.</li>
                  <li className="flex gap-2"><span className="text-blue-400 font-bold">4.</span> Our team confirms within 24h and credits your account.</li>
                </ol>
              </div>

              {/* Admin wallets */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Wallet Addresses</h2>
              <div className="space-y-3 mb-8">
                {COINS.map((coin) => {
                  const addr = settings?.adminWallets[coin];
                  return (
                    <div key={coin} className="bg-white/4 border border-white/8 rounded-xl p-4 flex items-center gap-4">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: COIN_COLORS[coin] + "22", color: COIN_COLORS[coin] }}
                      >
                        {coin.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{COIN_LABELS[coin]}</p>
                        {addr ? (
                          <p className="text-xs text-gray-400 font-mono truncate">{addr}</p>
                        ) : (
                          <p className="text-xs text-gray-600 italic">Address not configured yet</p>
                        )}
                      </div>
                      {addr && <CopyButton text={addr} />}
                    </div>
                  );
                })}
              </div>

              {/* Submit deposit */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Confirm Your Deposit</h2>
              <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
                {depMsg && (
                  <motion.div
                    className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
                      depMsg.type === "success"
                        ? "bg-green-500/15 border-green-500/30 text-green-400"
                        : "bg-red-500/15 border-red-500/30 text-red-400"
                    }`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {depMsg.text}
                  </motion.div>
                )}
                <form onSubmit={submitDeposit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Coin</label>
                      <select
                        value={depCoin}
                        onChange={(e) => setDepCoin(e.target.value as CoinKey)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/60 transition-all"
                      >
                        {COINS.map((c) => <option key={c} value={c} className="bg-[#0a0a1a]">{c} — {COIN_LABELS[c]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount Sent</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={depAmount}
                        onChange={(e) => setDepAmount(e.target.value)}
                        required
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Transaction Hash (TX ID)</label>
                    <input
                      type="text"
                      value={depTxHash}
                      onChange={(e) => setDepTxHash(e.target.value)}
                      required
                      placeholder="Paste your transaction hash here"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-blue-500/60 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={depLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {depLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Submit Deposit"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ─── WITHDRAW ─── */}
          {tab === "withdraw" && (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Withdraw Funds</h1>
                <p className="text-gray-400 text-sm mt-1">Request a withdrawal to your personal wallet</p>
              </div>

              {wdStatus?.locked ? (
                <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-2xl p-6 mb-6 flex gap-4">
                  <Lock className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-300 mb-1">Withdrawals Locked</p>
                    <p className="text-sm text-yellow-400/80">{wdStatus.reason}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/25 rounded-2xl p-4 mb-6 flex gap-3 items-center">
                  <Unlock className="w-5 h-5 text-green-400 shrink-0" />
                  <p className="text-sm text-green-300">Withdrawals are available. Requests are processed within 24–48 hours.</p>
                </div>
              )}

              {/* Balances summary */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Available Balances</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {COINS.map((coin) => {
                  const total = (user?.balance[coin] || 0) + (user?.earnings[coin] || 0);
                  return (
                    <div key={coin} className="bg-white/4 border border-white/8 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: COIN_COLORS[coin] + "22", color: COIN_COLORS[coin] }}
                        >
                          {coin.slice(0, 1)}
                        </div>
                        <span className="text-xs font-medium text-gray-400">{coin}</span>
                      </div>
                      <p className="text-base font-bold text-white">{total.toFixed(6)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Withdrawal form */}
              <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
                {wdMsg && (
                  <motion.div
                    className={`mb-4 px-4 py-3 rounded-xl text-sm border ${
                      wdMsg.type === "success"
                        ? "bg-green-500/15 border-green-500/30 text-green-400"
                        : "bg-red-500/15 border-red-500/30 text-red-400"
                    }`}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {wdMsg.text}
                  </motion.div>
                )}
                <form onSubmit={submitWithdrawal} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Coin</label>
                      <select
                        value={wdCoin}
                        onChange={(e) => setWdCoin(e.target.value as CoinKey)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/60 transition-all"
                      >
                        {COINS.map((c) => (
                          <option key={c} value={c} className="bg-[#0a0a1a]">
                            {c} — Available: {((user?.balance[c] || 0) + (user?.earnings[c] || 0)).toFixed(6)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={wdAmount}
                          onChange={(e) => setWdAmount(e.target.value)}
                          required
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setWdAmount(((user?.balance[wdCoin] || 0) + (user?.earnings[wdCoin] || 0)).toFixed(6))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Your {wdCoin} Wallet Address</label>
                    <input
                      type="text"
                      value={wdAddress}
                      onChange={(e) => setWdAddress(e.target.value)}
                      required
                      placeholder={`Enter your ${wdCoin} wallet address`}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-blue-500/60 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={wdLoading || (wdStatus?.locked ?? false)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold hover:from-green-500 hover:to-teal-500 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {wdLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Request Withdrawal"}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* ─── HISTORY ─── */}
          {tab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Transaction History</h1>
                <p className="text-gray-400 text-sm mt-1">All your deposits and withdrawal requests</p>
              </div>

              {/* Deposits */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Deposits</h2>
              {user?.deposits.length === 0 ? (
                <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center text-gray-500 mb-8">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No deposits yet</p>
                </div>
              ) : (
                <div className="space-y-2 mb-8">
                  {[...(user?.deposits || [])].reverse().map((dep) => (
                    <div key={dep.id} className="bg-white/4 border border-white/8 rounded-xl p-4 flex flex-wrap items-center gap-3">
                      <ArrowDownCircle className="w-5 h-5 text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{dep.amount} {dep.coin}</span>
                          <CoinBadge coin={dep.coin} />
                          <StatusBadge status={dep.status} />
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">TX: {dep.txHash}</p>
                        {dep.note && <p className="text-xs text-gray-400 mt-0.5">{dep.note}</p>}
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">
                        {new Date(dep.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Withdrawals */}
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Withdrawals</h2>
              {user?.withdrawals.length === 0 ? (
                <div className="bg-white/3 border border-white/8 rounded-2xl p-8 text-center text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No withdrawal requests yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...(user?.withdrawals || [])].reverse().map((wd) => (
                    <div key={wd.id} className="bg-white/4 border border-white/8 rounded-xl p-4 flex flex-wrap items-center gap-3">
                      <ArrowUpCircle className="w-5 h-5 text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{wd.amount} {wd.coin}</span>
                          <CoinBadge coin={wd.coin} />
                          <StatusBadge status={wd.status} />
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">To: {wd.address}</p>
                        {wd.note && <p className="text-xs text-gray-400 mt-0.5">{wd.note}</p>}
                      </div>
                      <span className="text-xs text-gray-500 shrink-0">
                        {new Date(wd.requestDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
