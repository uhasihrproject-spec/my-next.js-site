"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Settings,
  LayoutDashboard,
  LogOut,
  Loader2,
  Check,
  X,
  Lock,
  Unlock,
  Save,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Edit3,
  RefreshCw,
  Clock,
  Wallet,
} from "lucide-react";
import type { CoinKey } from "@/lib/db";

const COINS: CoinKey[] = ["BTC", "ETH", "USDT", "BNB", "SOL", "USDC"];
const COIN_COLORS: Record<CoinKey, string> = {
  BTC: "#f7931a", ETH: "#627eea", USDT: "#26a17b",
  BNB: "#f0b90b", SOL: "#9945ff", USDC: "#2775ca",
};

type AdminTab = "overview" | "users" | "deposits" | "withdrawals" | "settings";

interface UserData {
  id: string; name: string; email: string;
  balance: Partial<Record<CoinKey, number>>;
  earnings: Partial<Record<CoinKey, number>>;
  deposits: { id: string; coin: CoinKey; amount: number; txHash: string; status: string; note?: string; date: string }[];
  withdrawals: { id: string; coin: CoinKey; amount: number; address: string; status: string; note?: string; requestDate: string }[];
  withdrawalUnlockDate: string | null;
  customLock: boolean;
  createdAt: string;
}

interface DepositRow {
  id: string; userId: string; userName: string; userEmail: string;
  coin: CoinKey; amount: number; txHash: string; status: string; note?: string; date: string;
}

interface WithdrawalRow {
  id: string; userId: string; userName: string; userEmail: string;
  coin: CoinKey; amount: number; address: string; status: string; note?: string; requestDate: string;
}

interface SiteSettings {
  globalWithdrawalLock: boolean;
  globalWithdrawalLockReason: string;
  defaultWithdrawalLockDays: number;
  adminWallets: Partial<Record<CoinKey, string>>;
  siteName: string;
  adminEmail: string;
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
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] || "bg-gray-500/15 text-gray-400 border-gray-500/30"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function ActionNote({ onAction }: { onAction: (action: string, note: string) => void }) {
  const [note, setNote] = useState("");
  return (
    <div className="mt-2">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note for user..."
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500/40"
      />
      <div className="flex gap-2 mt-2">
        <button onClick={() => onAction("confirm", note)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 text-xs rounded-lg transition-colors">
          <Check className="w-3 h-3" /> Confirm
        </button>
        <button onClick={() => onAction("reject", note)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs rounded-lg transition-colors">
          <X className="w-3 h-3" /> Reject
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [depositFilter, setDepositFilter] = useState<string>("all");
  const [withdrawalFilter, setWithdrawalFilter] = useState<string>("all");
  const [depositActionOpen, setDepositActionOpen] = useState<string | null>(null);
  const [withdrawalActionOpen, setWithdrawalActionOpen] = useState<string | null>(null);
  const [userEdits, setUserEdits] = useState<Record<string, {
    balance: Partial<Record<CoinKey, string>>;
    earnings: Partial<Record<CoinKey, string>>;
    withdrawalUnlockDate: string;
    customLock: boolean;
  }>>({});

  const fetchAll = useCallback(async () => {
    const [meRes, usersRes, depsRes, wdsRes, settingsRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/admin/users"),
      fetch("/api/admin/deposits"),
      fetch("/api/admin/withdrawals"),
      fetch("/api/admin/settings"),
    ]);
    const meData = await meRes.json();
    if (!meData.user || meData.user.role !== "admin") {
      router.push("/login");
      return;
    }
    if (usersRes.ok) setUsers((await usersRes.json()).users);
    if (depsRes.ok) setDeposits((await depsRes.json()).deposits);
    if (wdsRes.ok) setWithdrawals((await wdsRes.json()).withdrawals);
    if (settingsRes.ok) setSettings((await settingsRes.json()).settings);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function initUserEdit(user: UserData) {
    setUserEdits((prev) => ({
      ...prev,
      [user.id]: {
        balance: Object.fromEntries(COINS.map(c => [c, String(user.balance[c] || "")])) as Partial<Record<CoinKey, string>>,
        earnings: Object.fromEntries(COINS.map(c => [c, String(user.earnings[c] || "")])) as Partial<Record<CoinKey, string>>,
        withdrawalUnlockDate: user.withdrawalUnlockDate ? user.withdrawalUnlockDate.split("T")[0] : "",
        customLock: user.customLock,
      }
    }));
  }

  function toggleUser(user: UserData) {
    if (expandedUser === user.id) {
      setExpandedUser(null);
    } else {
      setExpandedUser(user.id);
      if (!userEdits[user.id]) initUserEdit(user);
    }
  }

  async function saveUser(userId: string) {
    const edits = userEdits[userId];
    if (!edits) return;
    setSavingUser(userId);
    try {
      const balance: Partial<Record<CoinKey, number>> = {};
      const earnings: Partial<Record<CoinKey, number>> = {};
      for (const c of COINS) {
        const b = parseFloat(edits.balance[c] || "");
        const e = parseFloat(edits.earnings[c] || "");
        if (!isNaN(b)) balance[c] = b;
        if (!isNaN(e)) earnings[c] = e;
      }
      await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance,
          earnings,
          withdrawalUnlockDate: edits.withdrawalUnlockDate || null,
          customLock: edits.customLock,
        }),
      });
      await fetchAll();
      setActionMsg("User updated successfully.");
      setTimeout(() => setActionMsg(null), 3000);
    } finally {
      setSavingUser(null);
    }
  }

  async function handleDepositAction(dep: DepositRow, action: string, note: string) {
    await fetch("/api/admin/deposits", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: dep.userId, depositId: dep.id, action, note }),
    });
    setDepositActionOpen(null);
    await fetchAll();
    setActionMsg(`Deposit ${action === "confirm" ? "confirmed" : "rejected"}.`);
    setTimeout(() => setActionMsg(null), 3000);
  }

  async function handleWithdrawalAction(wd: WithdrawalRow, action: string, note: string) {
    await fetch("/api/admin/withdrawals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: wd.userId, withdrawalId: wd.id, action, note }),
    });
    setWithdrawalActionOpen(null);
    await fetchAll();
    setActionMsg(`Withdrawal ${action}ed.`);
    setTimeout(() => setActionMsg(null), 3000);
  }

  async function saveSettings() {
    if (!settings) return;
    setSavingSettings(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSettingsMsg("Settings saved.");
      setTimeout(() => setSettingsMsg(null), 3000);
    } finally {
      setSavingSettings(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const pendingDeposits = deposits.filter(d => d.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending").length;

  const filteredDeposits = depositFilter === "all" ? deposits : deposits.filter(d => d.status === "pending");
  const filteredWithdrawals = withdrawalFilter === "all" ? withdrawals : withdrawals.filter(w => w.status === "pending" || w.status === "processing");

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" />, badge: users.length },
    { id: "deposits", label: "Deposits", icon: <ArrowDownCircle className="w-4 h-4" />, badge: pendingDeposits },
    { id: "withdrawals", label: "Withdrawals", icon: <ArrowUpCircle className="w-4 h-4" />, badge: pendingWithdrawals },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white flex">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-white/3 border-r border-white/8 h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-white/8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VaultX
            </span>
          </Link>
          <div className="mt-3 px-1 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400 text-center font-medium">
            Admin Panel
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                tab === item.id
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                  item.id === "deposits" || item.id === "withdrawals"
                    ? "bg-yellow-500 text-black"
                    : "bg-white/15 text-gray-300"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/8">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        {actionMsg && (
          <motion.div
            className="fixed bottom-6 right-6 px-5 py-3 bg-green-600 text-white text-sm rounded-xl shadow-xl z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {actionMsg}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ─── OVERVIEW ─── */}
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Overview</h1>
                  <p className="text-gray-400 text-sm mt-0.5">Platform snapshot</p>
                </div>
                <button onClick={fetchAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm transition-all">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Users", value: users.length, color: "blue", icon: <Users className="w-5 h-5" /> },
                  { label: "Pending Deposits", value: pendingDeposits, color: "yellow", icon: <ArrowDownCircle className="w-5 h-5" /> },
                  { label: "Pending Withdrawals", value: pendingWithdrawals, color: "purple", icon: <ArrowUpCircle className="w-5 h-5" /> },
                  { label: "Locked Accounts", value: users.filter(u => u.customLock).length, color: "red", icon: <Lock className="w-5 h-5" /> },
                ].map((stat) => (
                  <div key={stat.label} className={`bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-2xl p-5`}>
                    <div className={`text-${stat.color}-400 mb-2`}>{stat.icon}</div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent deposits */}
                <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white">Recent Deposits</h2>
                    <button onClick={() => setTab("deposits")} className="text-xs text-blue-400 hover:text-blue-300">View all</button>
                  </div>
                  {deposits.slice(0, 5).map((dep) => (
                    <div key={dep.id} className="flex items-center gap-3 py-2.5 border-t border-white/5 first:border-0">
                      <ArrowDownCircle className="w-4 h-4 text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{dep.userName}</p>
                        <p className="text-xs text-gray-500">{dep.amount} {dep.coin}</p>
                      </div>
                      <StatusBadge status={dep.status} />
                    </div>
                  ))}
                  {deposits.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No deposits yet</p>}
                </div>

                {/* Recent withdrawals */}
                <div className="bg-white/4 border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-white">Recent Withdrawals</h2>
                    <button onClick={() => setTab("withdrawals")} className="text-xs text-blue-400 hover:text-blue-300">View all</button>
                  </div>
                  {withdrawals.slice(0, 5).map((wd) => (
                    <div key={wd.id} className="flex items-center gap-3 py-2.5 border-t border-white/5 first:border-0">
                      <ArrowUpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{wd.userName}</p>
                        <p className="text-xs text-gray-500">{wd.amount} {wd.coin}</p>
                      </div>
                      <StatusBadge status={wd.status} />
                    </div>
                  ))}
                  {withdrawals.length === 0 && <p className="text-gray-500 text-sm py-4 text-center">No withdrawals yet</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── USERS ─── */}
          {tab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <p className="text-gray-400 text-sm mt-0.5">Manage balances, earnings, and withdrawal locks</p>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No users registered yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => {
                    const isExpanded = expandedUser === user.id;
                    const edit = userEdits[user.id];
                    return (
                      <div key={user.id} className="bg-white/4 border border-white/8 rounded-2xl overflow-hidden">
                        {/* User row */}
                        <div
                          className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/3 transition-colors"
                          onClick={() => toggleUser(user)}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">{user.name}</p>
                              {user.customLock && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-400 border border-red-500/30">Locked</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
                            <span>{user.deposits.length} deposits</span>
                            <span>{user.withdrawals.length} withdrawals</span>
                            <span>Since {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                        </div>

                        {/* Expanded editor */}
                        <AnimatePresence>
                          {isExpanded && edit && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="border-t border-white/8 overflow-hidden"
                            >
                              <div className="p-5 space-y-5">
                                {/* Balance & Earnings */}
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                    <Edit3 className="w-4 h-4" /> Balance & Earnings
                                  </h3>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {COINS.map((coin) => (
                                      <div key={coin} className="bg-white/3 border border-white/8 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-2">
                                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: COIN_COLORS[coin] + "44" }} />
                                          <span className="text-xs font-bold" style={{ color: COIN_COLORS[coin] }}>{coin}</span>
                                        </div>
                                        <label className="text-xs text-gray-500 block mb-1">Balance</label>
                                        <input
                                          type="number"
                                          step="any"
                                          value={edit.balance[coin] ?? ""}
                                          onChange={(e) => setUserEdits(prev => ({
                                            ...prev,
                                            [user.id]: { ...prev[user.id], balance: { ...prev[user.id].balance, [coin]: e.target.value } }
                                          }))}
                                          placeholder="0"
                                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500/40"
                                        />
                                        <label className="text-xs text-gray-500 block mt-2 mb-1">Earnings</label>
                                        <input
                                          type="number"
                                          step="any"
                                          value={edit.earnings[coin] ?? ""}
                                          onChange={(e) => setUserEdits(prev => ({
                                            ...prev,
                                            [user.id]: { ...prev[user.id], earnings: { ...prev[user.id].earnings, [coin]: e.target.value } }
                                          }))}
                                          placeholder="0"
                                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-green-500/40"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Withdrawal controls */}
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Withdrawal Controls
                                  </h3>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-xs text-gray-400 block mb-1.5">Unlock Date (withdrawals allowed after this date)</label>
                                      <input
                                        type="date"
                                        value={edit.withdrawalUnlockDate}
                                        onChange={(e) => setUserEdits(prev => ({
                                          ...prev,
                                          [user.id]: { ...prev[user.id], withdrawalUnlockDate: e.target.value }
                                        }))}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/40 [color-scheme:dark]"
                                      />
                                      <p className="text-xs text-gray-600 mt-1">Leave empty to allow withdrawals immediately.</p>
                                    </div>
                                    <div className="flex items-start gap-3 mt-1">
                                      <label className="relative inline-flex items-center cursor-pointer mt-0.5">
                                        <input
                                          type="checkbox"
                                          checked={edit.customLock}
                                          onChange={(e) => setUserEdits(prev => ({
                                            ...prev,
                                            [user.id]: { ...prev[user.id], customLock: e.target.checked }
                                          }))}
                                          className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-white/10 rounded-full peer peer-checked:bg-red-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
                                      </label>
                                      <div>
                                        <p className="text-sm text-white font-medium">Lock this account</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Prevents user from withdrawing regardless of unlock date.</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => saveUser(user.id)}
                                  disabled={savingUser === user.id}
                                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-60"
                                >
                                  {savingUser === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                  Save Changes
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── DEPOSITS ─── */}
          {tab === "deposits" && (
            <motion.div key="deposits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Deposit Requests</h1>
                  <p className="text-gray-400 text-sm mt-0.5">Confirm or reject user deposits</p>
                </div>
                <div className="flex gap-2">
                  {["all", "pending"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setDepositFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        depositFilter === f ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {f === "all" ? `All (${deposits.length})` : `Pending (${pendingDeposits})`}
                    </button>
                  ))}
                </div>
              </div>

              {filteredDeposits.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <ArrowDownCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No {depositFilter === "pending" ? "pending " : ""}deposits</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDeposits.map((dep) => (
                    <div key={dep.id} className="bg-white/4 border border-white/8 rounded-2xl p-5">
                      <div className="flex flex-wrap items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-white">{dep.userName}</span>
                            <span className="text-gray-500 text-sm">{dep.userEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold" style={{ color: COIN_COLORS[dep.coin] }}>{dep.amount} {dep.coin}</span>
                            <StatusBadge status={dep.status} />
                          </div>
                          <p className="text-xs text-gray-500 font-mono mt-1.5 break-all">TX: {dep.txHash}</p>
                          {dep.note && <p className="text-xs text-gray-400 mt-1 italic">Note: {dep.note}</p>}
                          <p className="text-xs text-gray-600 mt-1">{new Date(dep.date).toLocaleString()}</p>
                        </div>
                        {dep.status === "pending" && (
                          <div className="min-w-[200px]">
                            {depositActionOpen === dep.id ? (
                              <ActionNote onAction={(action, note) => handleDepositAction(dep, action, note)} />
                            ) : (
                              <button
                                onClick={() => setDepositActionOpen(dep.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-sm rounded-xl hover:bg-yellow-500/25 transition-colors"
                              >
                                <Check className="w-4 h-4" /> Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── WITHDRAWALS ─── */}
          {tab === "withdrawals" && (
            <motion.div key="withdrawals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">Withdrawal Requests</h1>
                  <p className="text-gray-400 text-sm mt-0.5">Process and manage withdrawal requests</p>
                </div>
                <div className="flex gap-2">
                  {["all", "active"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setWithdrawalFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        withdrawalFilter === f ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      {f === "all" ? `All (${withdrawals.length})` : `Active (${withdrawals.filter(w => w.status === "pending" || w.status === "processing").length})`}
                    </button>
                  ))}
                </div>
              </div>

              {filteredWithdrawals.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <ArrowUpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No withdrawal requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWithdrawals.map((wd) => (
                    <div key={wd.id} className="bg-white/4 border border-white/8 rounded-2xl p-5">
                      <div className="flex flex-wrap items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-white">{wd.userName}</span>
                            <span className="text-gray-500 text-sm">{wd.userEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold" style={{ color: COIN_COLORS[wd.coin] }}>{wd.amount} {wd.coin}</span>
                            <StatusBadge status={wd.status} />
                          </div>
                          <p className="text-xs text-gray-500 font-mono mt-1.5 break-all">To: {wd.address}</p>
                          {wd.note && <p className="text-xs text-gray-400 mt-1 italic">Note: {wd.note}</p>}
                          <p className="text-xs text-gray-600 mt-1">{new Date(wd.requestDate).toLocaleString()}</p>
                        </div>
                        {(wd.status === "pending" || wd.status === "processing") && (
                          <div className="min-w-[220px]">
                            {withdrawalActionOpen === wd.id ? (
                              <div className="mt-1">
                                <input
                                  id={`wd-note-${wd.id}`}
                                  type="text"
                                  placeholder="Optional note..."
                                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500/40 mb-2"
                                />
                                <div className="flex gap-2">
                                  {wd.status === "pending" && (
                                    <button
                                      onClick={() => {
                                        const note = (document.getElementById(`wd-note-${wd.id}`) as HTMLInputElement)?.value || "";
                                        handleWithdrawalAction(wd, "process", note);
                                      }}
                                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs rounded-lg"
                                    >
                                      Processing
                                    </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      const note = (document.getElementById(`wd-note-${wd.id}`) as HTMLInputElement)?.value || "";
                                      handleWithdrawalAction(wd, "complete", note);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 text-xs rounded-lg"
                                  >
                                    <Check className="w-3 h-3" /> Complete
                                  </button>
                                  <button
                                    onClick={() => {
                                      const note = (document.getElementById(`wd-note-${wd.id}`) as HTMLInputElement)?.value || "";
                                      handleWithdrawalAction(wd, "reject", note);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs rounded-lg"
                                  >
                                    <X className="w-3 h-3" /> Reject
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setWithdrawalActionOpen(wd.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-400 text-sm rounded-xl hover:bg-purple-500/25 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" /> Manage
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── SETTINGS ─── */}
          {tab === "settings" && settings && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
                <p className="text-gray-400 text-sm mt-0.5">Configure withdrawals, wallet addresses, and platform details</p>
              </div>

              {settingsMsg && (
                <motion.div
                  className="mb-5 px-4 py-3 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {settingsMsg}
                </motion.div>
              )}

              <div className="space-y-6 max-w-2xl">
                {/* Global Withdrawal Lock */}
                <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
                  <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    Global Withdrawal Lock
                  </h2>
                  <div className="flex items-start gap-4 mb-4">
                    <label className="relative inline-flex items-center cursor-pointer mt-0.5">
                      <input
                        type="checkbox"
                        checked={settings.globalWithdrawalLock}
                        onChange={(e) => setSettings({ ...settings, globalWithdrawalLock: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-red-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                    <div>
                      <p className="text-sm text-white font-medium flex items-center gap-2">
                        {settings.globalWithdrawalLock ? (
                          <><Lock className="w-4 h-4 text-red-400" /><span className="text-red-400">All withdrawals are LOCKED</span></>
                        ) : (
                          <><Unlock className="w-4 h-4 text-green-400" /><span className="text-green-400">Withdrawals are open</span></>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">When enabled, no user can request a withdrawal.</p>
                    </div>
                  </div>
                  {settings.globalWithdrawalLock && (
                    <div>
                      <label className="text-xs text-gray-400 block mb-1.5">Lock Reason (shown to users)</label>
                      <input
                        type="text"
                        value={settings.globalWithdrawalLockReason}
                        onChange={(e) => setSettings({ ...settings, globalWithdrawalLockReason: e.target.value })}
                        placeholder="e.g. Maintenance period — withdrawals resume shortly."
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/40"
                      />
                    </div>
                  )}
                </div>

                {/* Default Lock Period */}
                <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
                  <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Default Withdrawal Lock Period
                  </h2>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5">Days after first deposit before withdrawals are allowed</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        value={settings.defaultWithdrawalLockDays}
                        onChange={(e) => setSettings({ ...settings, defaultWithdrawalLockDays: parseInt(e.target.value) || 0 })}
                        className="w-28 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/40"
                      />
                      <span className="text-sm text-gray-400">days (0 = no lock)</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Applied automatically when a deposit is confirmed. You can override per user in User Management.</p>
                  </div>
                </div>

                {/* Admin Wallet Addresses */}
                <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
                  <h2 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-400" />
                    Deposit Wallet Addresses
                  </h2>
                  <p className="text-xs text-gray-500 mb-4">Users will send funds to these addresses. Shown on the deposit page.</p>
                  <div className="space-y-3">
                    {COINS.map((coin) => (
                      <div key={coin} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: COIN_COLORS[coin] + "22", color: COIN_COLORS[coin] }}
                        >
                          {coin.slice(0, 2)}
                        </div>
                        <input
                          type="text"
                          value={settings.adminWallets[coin] || ""}
                          onChange={(e) => setSettings({ ...settings, adminWallets: { ...settings.adminWallets, [coin]: e.target.value } })}
                          placeholder={`${coin} wallet address`}
                          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-xs placeholder-gray-600 focus:outline-none focus:border-blue-500/40"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Info */}
                <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
                  <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    Platform Info
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1.5">Site Name</label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1.5">Support Email</label>
                      <input
                        type="email"
                        value={settings.adminEmail}
                        onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/40"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60"
                >
                  {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save All Settings
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

