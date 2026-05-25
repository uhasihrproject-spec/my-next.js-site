"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, ArrowDownCircle, ArrowUpCircle,
  Settings, MessageSquare, LogOut, Loader2, Check, X,
  Save, Globe, Clock, Wallet, RefreshCw,
  ArrowLeft, Send, AlertTriangle, CheckCircle2,
  ChevronRight, Lock, Unlock, ArrowRight, Trash2,
} from "lucide-react";
import type { CoinKey } from "@/lib/db";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

/* ─── Constants ─── */
const COINS: CoinKey[] = [
  "BTC", "ETH", "USDT", "BNB", "SOL", "USDC",
  "XRP", "ADA", "DOGE", "TRX", "AVAX", "DOT",
  "LINK", "MATIC", "LTC", "BCH", "SHIB", "AAVE", "UNI", "XMR",
];
const COIN_COLORS: Record<CoinKey, string> = {
  BTC: "#f7931a", ETH: "#627eea", USDT: "#26a17b",
  BNB: "#f0b90b", SOL: "#9945ff", USDC: "#2775ca",
  XRP: "#00aae4", ADA: "#0033ad", DOGE: "#c2a633",
  TRX: "#ff060a", AVAX: "#e84142", DOT: "#e6007a",
  LINK: "#2a5ada", MATIC: "#8247e5", LTC: "#345d9d",
  BCH: "#8dc351", SHIB: "#ffa409", AAVE: "#b6509e",
  UNI: "#ff007a", XMR: "#ff6600",
};

type Tab = "overview" | "users" | "deposits" | "withdrawals" | "messages" | "settings";

/* ─── Types ─── */
interface UserData {
  id: string; name: string; email: string;
  balance: Partial<Record<CoinKey, number>>;
  earnings: Partial<Record<CoinKey, number>>;
  deposits: { id: string; coin: CoinKey; amount: number; txHash: string; status: string; note?: string; date: string }[];
  withdrawals: { id: string; coin: CoinKey; amount: number; address: string; status: string; note?: string; requestDate: string; networkFee?: number }[];
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
  networkFee?: number;
}
interface SiteSettings {
  globalWithdrawalLock: boolean; globalWithdrawalLockReason: string;
  defaultWithdrawalLockDays: number; adminWallets: Partial<Record<CoinKey, string>>;
  siteName: string; adminEmail: string;
}
interface ChatMsg { id: string; text: string; from: "user" | "admin"; createdAt: string; }
interface ConvoData {
  userId: string; userName: string; userEmail: string;
  messages: ChatMsg[]; unread: number; lastAt: string;
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:    "text-amber-400 bg-amber-400/[0.08] border-amber-400/20",
    confirmed:  "text-emerald-400 bg-emerald-400/[0.08] border-emerald-400/20",
    rejected:   "text-red-400 bg-red-400/[0.08] border-red-400/20",
    processing: "text-blue-400 bg-blue-400/[0.08] border-blue-400/20",
    completed:  "text-emerald-400 bg-emerald-400/[0.08] border-emerald-400/20",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-normal tracking-widest uppercase border ${map[status] || "text-zinc-400 bg-zinc-400/[0.08] border-zinc-400/20"}`}>
      {status}
    </span>
  );
}

/* ─── Toast ─── */
function Toast({ msg, type = "success" }: { msg: string; type?: "success" | "error" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-2xl border shadow-2xl text-[13px] font-normal whitespace-nowrap ${
        type === "success"
          ? "bg-[#1a1a1e] border-emerald-500/25 text-emerald-400"
          : "bg-[#1a1a1e] border-red-500/25 text-red-400"
      }`}
    >
      {type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {msg}
    </motion.div>
  );
}

/* ─── Backdrop ─── */
function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
      onClick={onClick}
    />
  );
}

/* ─────────────────────────────────────────────────
   USER DRAWER — slides in from right
   Step 1: Balances & Earnings
   Step 2: Withdrawal Controls
───────────────────────────────────────────────── */
function UserDrawer({
  user, edit, onClose, onChangeBalance, onChangeEarnings,
  onChangeDate, onChangeLock, onSave, onDelete, saving, deleting,
}: {
  user: UserData;
  edit: { balance: Partial<Record<CoinKey, string>>; earnings: Partial<Record<CoinKey, string>>; withdrawalUnlockDate: string; customLock: boolean };
  onClose: () => void;
  onChangeBalance: (coin: CoinKey, val: string) => void;
  onChangeEarnings: (coin: CoinKey, val: string) => void;
  onChangeDate: (val: string) => void;
  onChangeLock: (val: boolean) => void;
  onSave: () => void;
  onDelete: () => void;
  saving: boolean;
  deleting: boolean;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <>
      <Backdrop onClick={onClose} />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 w-full md:w-[460px] z-[70] bg-[#111113] border-l border-white/[0.06] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-[13px] font-normal text-blue-400 shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-normal text-zinc-200 truncate">{user.name}</p>
            <p className="text-[11px] font-light text-zinc-600 truncate">{user.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-all shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            {[{ n: 1, label: "Balances" }, { n: 2, label: "Access" }].map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-2">
                <button onClick={() => setStep(n as 1 | 2)} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-normal transition-all ${
                    step === n ? "bg-blue-600/25 border border-blue-500/40 text-blue-400"
                    : step > n ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                    : "bg-white/[0.05] border border-white/[0.07] text-zinc-600"
                  }`}>
                    {step > n ? <Check className="w-3 h-3" /> : n}
                  </div>
                  <span className={`text-[12px] font-light transition-colors ${step === n ? "text-zinc-300" : "text-zinc-600"}`}>{label}</span>
                </button>
                {i < 1 && <div className={`w-8 h-px transition-colors ${step > n ? "bg-emerald-500/30" : "bg-white/[0.06]"}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                <p className="text-[11px] font-normal tracking-widest text-zinc-600 uppercase mb-4">Balances & Earnings per coin</p>
                <div className="space-y-2">
                  {COINS.map((coin) => (
                    <div key={coin} className="bg-[#1a1a1e] border border-white/[0.05] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COIN_COLORS[coin] }} />
                        <span className="text-[12px] font-normal" style={{ color: COIN_COLORS[coin] }}>{coin}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-normal tracking-widest text-zinc-700 uppercase block mb-1.5">Balance</label>
                          <input type="number" step="any" placeholder="0"
                            value={edit.balance[coin] ?? ""}
                            onChange={(e) => onChangeBalance(coin, e.target.value)}
                            className="w-full px-3 py-2 bg-[#111113] border border-white/[0.07] rounded-lg text-white text-[13px] font-light focus:outline-none focus:border-blue-500/30 [appearance:textfield] placeholder:text-zinc-700"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-normal tracking-widest text-zinc-700 uppercase block mb-1.5">Earnings</label>
                          <input type="number" step="any" placeholder="0"
                            value={edit.earnings[coin] ?? ""}
                            onChange={(e) => onChangeEarnings(coin, e.target.value)}
                            className="w-full px-3 py-2 bg-[#111113] border border-white/[0.07] rounded-lg text-white text-[13px] font-light focus:outline-none focus:border-emerald-500/30 [appearance:textfield] placeholder:text-zinc-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                <p className="text-[11px] font-normal tracking-widest text-zinc-600 uppercase mb-4">Withdrawal Controls</p>

                {/* Unlock date */}
                <div className="bg-[#1a1a1e] border border-white/[0.05] rounded-xl p-5 mb-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-zinc-600" />
                    <p className="text-[13px] font-normal text-zinc-300">Unlock Date</p>
                  </div>
                  <input type="date" value={edit.withdrawalUnlockDate}
                    onChange={(e) => onChangeDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111113] border border-white/[0.07] rounded-xl text-white text-[13px] font-light focus:outline-none focus:border-blue-500/40 [color-scheme:dark] mb-2"
                  />
                  <p className="text-[11px] font-light text-zinc-700">Empty = withdrawals allowed now.</p>
                </div>

                {/* Lock toggle */}
                <div className="bg-[#1a1a1e] border border-white/[0.05] rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${edit.customLock ? "bg-red-500/10" : "bg-white/[0.04]"}`}>
                        {edit.customLock ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-zinc-600" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-normal text-zinc-200">Account Lock</p>
                        <p className="text-[11px] font-light text-zinc-600 mt-0.5">Block all withdrawals for this user</p>
                      </div>
                    </div>
                    <label className="relative cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={edit.customLock}
                        onChange={(e) => onChangeLock(e.target.checked)} />
                      <div className="w-10 h-5 bg-white/[0.07] rounded-full peer peer-checked:bg-red-600/60 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                </div>

                {/* Danger zone — delete user */}
                <div className="bg-red-500/[0.04] border border-red-500/15 rounded-xl p-5 mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <p className="text-[13px] font-normal text-red-300">Delete account</p>
                  </div>
                  <p className="text-[11px] font-light text-zinc-600 mb-3 leading-relaxed">
                    Permanently removes {user.name} and all of their data. This cannot be undone.
                  </p>
                  <button
                    onClick={() => { if (confirmDel) onDelete(); else setConfirmDel(true); }}
                    disabled={deleting}
                    className={`w-full py-2.5 rounded-xl text-[12px] font-normal transition-colors flex items-center justify-center gap-2 ${
                      confirmDel
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : "bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/15"
                    }`}
                  >
                    {deleting
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                    {deleting ? "Deleting…" : confirmDel ? "Tap again to permanently delete" : "Delete this user"}
                  </button>
                  {confirmDel && !deleting && (
                    <button onClick={() => setConfirmDel(false)}
                      className="w-full mt-2 py-1.5 text-[11px] font-light text-zinc-600 hover:text-zinc-400 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex items-center gap-3">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 bg-white/[0.04] border border-white/[0.07] text-zinc-500 hover:text-zinc-300 text-[13px] font-light rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 bg-white/[0.07] hover:bg-white/[0.1] text-zinc-200 text-[13px] font-normal rounded-xl transition-colors flex items-center justify-center gap-2">
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 bg-white/[0.04] border border-white/[0.07] text-zinc-500 hover:text-zinc-300 text-[13px] font-light rounded-xl transition-colors">
                ← Back
              </button>
              <button onClick={onSave} disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-normal rounded-xl transition-colors flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────
   ACTION SHEET — bottom sheet for deposit/withdrawal actions
───────────────────────────────────────────────── */
function ActionSheet({
  item, kind, note, onChangeNote, fee, onChangeFee, onAction, onClose,
}: {
  item: DepositRow | WithdrawalRow;
  kind: "deposit" | "withdrawal";
  note: string;
  onChangeNote: (v: string) => void;
  /** Network fee in coin units — only used for withdrawals. */
  fee?: string;
  onChangeFee?: (v: string) => void;
  onAction: (action: string) => void;
  onClose: () => void;
}) {
  const dep = kind === "deposit" ? (item as DepositRow) : null;
  const wd = kind === "withdrawal" ? (item as WithdrawalRow) : null;
  const isPending = item.status === "pending";
  const isProcessing = item.status === "processing";
  const canAct = isPending || isProcessing;

  return (
    <>
      <Backdrop onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[70] bg-[#111113] border-t border-white/[0.08] rounded-t-2xl"
        style={{ maxHeight: "85vh", overflowY: "auto" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/[0.1]" />
        </div>

        <div className="px-5 pt-2 pb-safe pb-6">
          {/* User + amount */}
          <div className="flex items-start gap-3.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/15 flex items-center justify-center text-[13px] font-normal text-blue-400 shrink-0">
              {item.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-normal text-zinc-200">{item.userName}</p>
              <p className="text-[11px] font-light text-zinc-600">{item.userEmail}</p>
            </div>
            <StatusBadge status={item.status} />
          </div>

          {/* Amount + detail */}
          <div className="bg-[#1a1a1e] border border-white/[0.05] rounded-xl p-4 mb-4">
            <p className="text-[24px] font-light leading-none mb-1" style={{ color: COIN_COLORS[item.coin] }}>
              {item.amount} <span className="text-[16px]">{item.coin}</span>
            </p>
            <p className="text-[10px] font-light text-zinc-600 mt-2 font-mono break-all">
              {dep ? `TX: ${dep.txHash}` : `To: ${wd!.address}`}
            </p>
            {item.note && <p className="text-[12px] font-light text-zinc-500 mt-2 italic">{item.note}</p>}
            <p className="text-[10px] font-light text-zinc-700 mt-2">
              {new Date(dep ? dep.date : wd!.requestDate).toLocaleString()}
            </p>
          </div>

          {canAct && (
            <>
              {/* Note input */}
              <div className="mb-4">
                <label className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase block mb-2">Note for user (optional)</label>
                <input type="text" value={note} onChange={(e) => onChangeNote(e.target.value)}
                  placeholder="e.g. Transaction verified…"
                  className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/[0.06] rounded-xl text-white text-[13px] font-light placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/30"
                />
              </div>

              {/* Withdrawal network fee (optional) */}
              {kind === "withdrawal" && onChangeFee && (
                <div className="mb-4">
                  <label className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase block mb-2">
                    Network fee in {item.coin} (optional)
                  </label>
                  <div className="relative">
                    <input
                      type="number" step="any" min="0"
                      value={fee ?? ""} onChange={(e) => onChangeFee(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 pr-16 bg-[#1a1a1e] border border-white/[0.06] rounded-xl text-white text-[13px] font-light font-mono placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/30"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-light text-zinc-600 tracking-wider uppercase">{item.coin}</span>
                  </div>
                  <p className="text-[10px] font-light text-zinc-700 mt-1.5">
                    Defaults to 0. Added to the deduction at &ldquo;Mark completed&rdquo; and shown on the user&apos;s receipt.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2">
                {kind === "deposit" && (
                  <>
                    <button onClick={() => onAction("confirm")}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500/[0.1] border border-emerald-500/25 text-emerald-400 text-[14px] font-normal rounded-xl hover:bg-emerald-500/[0.18] active:scale-[0.98] transition-all">
                      <Check className="w-4 h-4" /> Confirm deposit
                    </button>
                    <button onClick={() => onAction("reject")}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/[0.07] border border-red-500/20 text-red-400 text-[14px] font-normal rounded-xl hover:bg-red-500/[0.14] active:scale-[0.98] transition-all">
                      <X className="w-4 h-4" /> Reject deposit
                    </button>
                  </>
                )}
                {kind === "withdrawal" && (
                  <>
                    {isPending && (
                      <button onClick={() => onAction("process")}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-500/[0.08] border border-blue-500/20 text-blue-400 text-[14px] font-normal rounded-xl hover:bg-blue-500/[0.15] active:scale-[0.98] transition-all">
                        Mark processing
                      </button>
                    )}
                    <button onClick={() => onAction("complete")}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500/[0.1] border border-emerald-500/25 text-emerald-400 text-[14px] font-normal rounded-xl hover:bg-emerald-500/[0.18] active:scale-[0.98] transition-all">
                      <Check className="w-4 h-4" /> Mark completed
                    </button>
                    <button onClick={() => onAction("reject")}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/[0.07] border border-red-500/20 text-red-400 text-[14px] font-normal rounded-xl hover:bg-red-500/[0.14] active:scale-[0.98] transition-all">
                      <X className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                <button onClick={onClose}
                  className="w-full py-3 text-zinc-600 text-[13px] font-light rounded-xl hover:text-zinc-400 transition-colors">
                  Cancel
                </button>
              </div>
            </>
          )}

          {!canAct && (
            <button onClick={onClose}
              className="w-full py-3.5 bg-white/[0.04] border border-white/[0.07] text-zinc-500 text-[13px] font-light rounded-xl hover:text-zinc-300 transition-colors">
              Close
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}

/* ─── Admin PIN gate ─── */
function AdminGate({ hasPin, onUnlock }: { hasPin: boolean; onUnlock: () => void }) {
  const [phase, setPhase] = useState<"enter" | "confirm" | "unlock">(hasPin ? "unlock" : "enter");
  const [pin, setPin] = useState("");
  const [first, setFirst] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [phase]);

  function fail(m: string) { setError(m); setShake(true); setTimeout(() => setShake(false), 450); }

  async function complete(value: string) {
    if (phase === "enter") {
      setFirst(value);
      setTimeout(() => { setPin(""); setError(""); setPhase("confirm"); }, 150);
      return;
    }
    if (phase === "confirm") {
      if (value !== first) {
        fail("PINs didn't match — start again");
        setTimeout(() => { setPin(""); setFirst(""); setPhase("enter"); }, 850);
        return;
      }
      setBusy(true);
      try {
        const r = await fetch("/api/auth/pin", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "set", pin: value }),
        });
        setBusy(false);
        if (!r.ok) { fail("Couldn't save PIN"); setTimeout(() => { setPin(""); setFirst(""); setPhase("enter"); }, 850); return; }
        onUnlock();
      } catch {
        setBusy(false);
        fail("Network error"); setTimeout(() => { setPin(""); setFirst(""); setPhase("enter"); }, 850);
      }
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/pin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", pin: value }),
      });
      setBusy(false);
      if (!r.ok) { fail("Incorrect PIN"); setTimeout(() => setPin(""), 500); return; }
      onUnlock();
    } catch {
      setBusy(false);
      fail("Network error"); setTimeout(() => setPin(""), 500);
    }
  }

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (busy) return;
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setError(""); setPin(v);
    if (v.length === 6) complete(v);
  }

  const title = phase === "enter" ? "Create your admin PIN"
    : phase === "confirm" ? "Confirm your admin PIN" : "Admin access";
  const sub = phase === "enter" ? "Set a 6-digit PIN to protect the admin panel"
    : phase === "confirm" ? "Re-enter the 6 digits to confirm" : "Enter your 6-digit PIN to continue";

  return (
    <div className="fixed inset-0 z-[100] bg-[#161618] flex flex-col items-center justify-center px-6 py-10">
      <div className="flex items-center gap-2 mb-auto">
        <Logo size={24} />
        <span className="font-normal text-white text-[14px]">VaultX Admin</span>
      </div>
      <div className="my-auto flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/[0.1] border border-blue-500/20 flex items-center justify-center mb-5">
          <Lock className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className="text-[19px] font-light text-white mb-1.5 text-center">{title}</h1>
        <p className="text-[12px] font-light text-zinc-500 mb-7 text-center">{sub}</p>
        <motion.div
          animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
          className="relative py-3 px-4 cursor-text" onClick={() => inputRef.current?.focus()}
        >
          <div className="flex gap-3.5 justify-center">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full border transition-all duration-150 ${
                error ? "border-red-500/50"
                  : i < pin.length ? "bg-blue-500 border-blue-500 scale-110" : "border-white/15"
              }`} />
            ))}
          </div>
          <input
            ref={inputRef} type="password" inputMode="numeric" autoFocus
            value={pin} onChange={onInput} maxLength={6} aria-label="Admin PIN"
            className="absolute inset-0 w-full h-full opacity-0" style={{ caretColor: "transparent" }}
          />
        </motion.div>
        <div className="h-5 mt-2">
          {error && <p className="text-[11px] font-light text-red-400">{error}</p>}
          {busy && !error && (
            <p className="text-[11px] font-light text-zinc-600 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Verifying…
            </p>
          )}
        </div>
        <p className="text-[11px] font-light text-zinc-600 mt-1">Type your 6-digit PIN</p>
      </div>
      <div className="flex items-center gap-1.5 mt-auto text-zinc-700">
        <Lock className="w-3 h-3" />
        <p className="text-[10px] font-light tracking-wide">Restricted area · authorized administrators only</p>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [conversations, setConversations] = useState<ConvoData[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [mobileChatView, setMobileChatView] = useState<"list" | "thread">("list");
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [depositFilter, setDepositFilter] = useState<"all" | "pending">("all");
  const [withdrawalFilter, setWithdrawalFilter] = useState<"all" | "active">("all");
  const [hasPin, setHasPin] = useState(false);
  const [adminLocked, setAdminLocked] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [testing, setTesting] = useState<"email" | "sms" | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Drawer + sheet state
  const [userDrawer, setUserDrawer] = useState<string | null>(null);
  const [actionSheet, setActionSheet] = useState<{ kind: "deposit" | "withdrawal"; id: string } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [actionFee, setActionFee] = useState("");

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [userEdits, setUserEdits] = useState<Record<string, {
    balance: Partial<Record<CoinKey, string>>;
    earnings: Partial<Record<CoinKey, string>>;
    withdrawalUnlockDate: string;
    customLock: boolean;
  }>>({});

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const fetchAll = useCallback(async () => {
    try {
      const [meR, usersR, depsR, wdsR, setR, msgsR] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/admin/users"),
        fetch("/api/admin/deposits"),
        fetch("/api/admin/withdrawals"),
        fetch("/api/admin/settings"),
        fetch("/api/admin/messages"),
      ]);
      const me = await meR.json();
      if (!me.user || me.user.role !== "admin") { router.push("/login"); return; }
      setHasPin(!!me.hasPin);
      if (usersR.ok) setUsers((await usersR.json()).users ?? []);
      if (depsR.ok) setDeposits((await depsR.json()).deposits ?? []);
      if (wdsR.ok) setWithdrawals((await wdsR.json()).withdrawals ?? []);
      if (setR.ok) setSettings((await setR.json()).settings);
      if (msgsR.ok) {
        const d = await msgsR.json();
        setConversations(d.conversations ?? []);
        setTotalUnread(d.totalUnread ?? 0);
      }
    } catch { /* silently ignore */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh every 15 s so new deposits, withdrawals, messages and user
  // updates show up without a manual reload. Pauses while a tab is hidden
  // (saves API calls) and resumes as soon as the admin focuses the page.
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        if (document.visibilityState === "visible") fetchAll();
      }, 15_000);
    };
    const stop = () => { if (interval) { clearInterval(interval); interval = null; } };
    const onVis = () => {
      if (document.visibilityState === "visible") { fetchAll(); start(); }
      else stop();
    };
    start();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [fetchAll]);

  useEffect(() => {
    if (tab === "messages") {
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [activeConvo, conversations, tab]);

  function initUserEdit(user: UserData) {
    setUserEdits((prev) => ({
      ...prev,
      [user.id]: {
        balance: Object.fromEntries(COINS.map((c) => [c, String(user.balance[c] ?? "")])) as Partial<Record<CoinKey, string>>,
        earnings: Object.fromEntries(COINS.map((c) => [c, String(user.earnings[c] ?? "")])) as Partial<Record<CoinKey, string>>,
        withdrawalUnlockDate: user.withdrawalUnlockDate ? user.withdrawalUnlockDate.split("T")[0] : "",
        customLock: user.customLock,
      },
    }));
  }

  function openUserDrawer(user: UserData) {
    if (!userEdits[user.id]) initUserEdit(user);
    setUserDrawer(user.id);
  }

  async function saveUser(userId: string) {
    const edits = userEdits[userId];
    if (!edits) return;
    setSavingUser(userId);
    try {
      const balance: Partial<Record<CoinKey, number>> = {};
      const earnings: Partial<Record<CoinKey, number>> = {};
      for (const c of COINS) {
        const b = parseFloat(edits.balance[c] ?? "");
        const e = parseFloat(edits.earnings[c] ?? "");
        if (!isNaN(b)) balance[c] = b;
        if (!isNaN(e)) earnings[c] = e;
      }
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance, earnings, withdrawalUnlockDate: edits.withdrawalUnlockDate || null, customLock: edits.customLock }),
      });
      if (res.ok) { await fetchAll(); showToast("User updated"); setUserDrawer(null); }
      else showToast("Failed to save", "error");
    } catch { showToast("Network error", "error"); }
    finally { setSavingUser(null); }
  }

  async function deleteUserAction(userId: string) {
    setDeletingUser(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) { setUserDrawer(null); await fetchAll(); showToast("User deleted"); }
      else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || "Failed to delete user", "error");
      }
    } catch { showToast("Network error", "error"); }
    finally { setDeletingUser(null); }
  }

  async function runTest(type: "email" | "sms") {
    setTesting(type); setTestResult(null);
    try {
      const res = await fetch("/api/admin/test-notify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, to: type === "email" ? testEmail : testPhone }),
      });
      const d = await res.json();
      setTestResult({ ok: !!d.ok, msg: d.ok ? d.message : (d.error || "Test failed") });
    } catch { setTestResult({ ok: false, msg: "Network error" }); }
    finally { setTesting(null); }
  }

  async function runReset() {
    setResetting(true);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "RESET" }),
      });
      if (res.ok) { setResetConfirm(false); await fetchAll(); showToast("All platform data cleared"); }
      else showToast("Reset failed", "error");
    } catch { showToast("Network error", "error"); }
    finally { setResetting(false); }
  }

  async function handleDepositAction(dep: DepositRow, action: string, note: string) {
    const res = await fetch("/api/admin/deposits", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: dep.userId, depositId: dep.id, action, note }),
    });
    setActionSheet(null); setActionNote("");
    if (res.ok) { await fetchAll(); showToast(`Deposit ${action === "confirm" ? "confirmed" : "rejected"}`); }
    else showToast("Action failed", "error");
  }

  async function handleWithdrawalAction(wd: WithdrawalRow, action: string, note: string, networkFee?: string) {
    const res = await fetch("/api/admin/withdrawals", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: wd.userId,
        withdrawalId: wd.id,
        action,
        note,
        // Send the fee only when the admin actually typed a number; falsy
        // strings ("", "0", "0.00") are all accepted by the API.
        ...(networkFee !== undefined ? { networkFee } : {}),
      }),
    });
    setActionSheet(null); setActionNote(""); setActionFee("");
    if (res.ok) { await fetchAll(); showToast(`Withdrawal ${action}ed`); }
    else showToast("Action failed", "error");
  }

  async function saveSettings() {
    if (!settings) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) showToast("Settings saved");
      else showToast("Failed to save", "error");
    } catch { showToast("Network error", "error"); }
    finally { setSavingSettings(false); }
  }

  async function sendReply() {
    if (!replyText.trim() || !activeConvo || sendingReply) return;
    setSendingReply(true);
    try {
      await fetch("/api/admin/messages", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeConvo, text: replyText.trim() }),
      });
      setReplyText(""); await fetchAll();
    } finally { setSendingReply(false); }
  }

  async function openConvo(userId: string, hasUnread: boolean) {
    setActiveConvo(userId); setMobileChatView("thread");
    if (hasUnread) {
      await fetch("/api/admin/messages", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, markRead: true }),
      });
      await fetchAll();
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const pendingDeposits = deposits.filter((d) => d.status === "pending").length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending" || w.status === "processing").length;
  const filteredDeposits = depositFilter === "all" ? deposits : deposits.filter((d) => d.status === "pending");
  const filteredWithdrawals = withdrawalFilter === "all" ? withdrawals : withdrawals.filter((w) => w.status === "pending" || w.status === "processing");

  const NAV: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview",     label: "Overview",     icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    { id: "users",        label: "Users",        icon: <Users className="w-[18px] h-[18px]" />, badge: users.length },
    { id: "deposits",     label: "Deposits",     icon: <ArrowDownCircle className="w-[18px] h-[18px]" />, badge: pendingDeposits },
    { id: "withdrawals",  label: "Withdrawals",  icon: <ArrowUpCircle className="w-[18px] h-[18px]" />, badge: pendingWithdrawals },
    { id: "messages",     label: "Messages",     icon: <MessageSquare className="w-[18px] h-[18px]" />, badge: totalUnread },
    { id: "settings",     label: "Settings",     icon: <Settings className="w-[18px] h-[18px]" /> },
  ];

  // Resolved action sheet item
  const actionItem = actionSheet
    ? actionSheet.kind === "deposit"
      ? deposits.find((d) => d.id === actionSheet.id)
      : withdrawals.find((w) => w.id === actionSheet.id)
    : null;

  const drawerUser = userDrawer ? users.find((u) => u.id === userDrawer) : null;
  const drawerEdit = userDrawer ? userEdits[userDrawer] : null;

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#161618] flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[13px] font-light tracking-widest uppercase">Loading</span>
        </div>
      </div>
    );
  }

  if (adminLocked) {
    return <AdminGate hasPin={hasPin} onUnlock={() => setAdminLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#161618] text-white flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-[#111113] border-r border-white/[0.05] h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-white/[0.05]">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Logo size={24} />
            <span className="text-white font-normal text-[14px]">VaultX</span>
          </Link>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-400/[0.07] border border-amber-400/20 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] font-normal tracking-widest text-amber-400 uppercase">Admin panel</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-light transition-all ${
                tab === item.id ? "bg-white/[0.07] text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
              }`}
            >
              <span className={tab === item.id ? "text-blue-400" : "text-zinc-700"}>{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[9px] font-normal rounded-md px-1.5 py-0.5 ${
                  item.id === "deposits" || item.id === "withdrawals" ? "bg-amber-400/15 text-amber-400"
                  : item.id === "messages" ? "bg-blue-600/20 text-blue-400"
                  : "bg-white/[0.07] text-zinc-400"
                }`}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.05] space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-light tracking-widest text-zinc-600 uppercase">Theme</span>
            <ThemeToggle compact />
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-light text-zinc-600 hover:text-red-400 hover:bg-red-500/[0.05] transition-all">
            <LogOut className="w-[18px] h-[18px]" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-h-screen overflow-auto pb-24 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <AnimatePresence mode="wait">

            {/* ══ OVERVIEW ══ */}
            {tab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-light tracking-widest text-zinc-600 uppercase mb-1">Control panel</p>
                    <h1 className="text-xl font-light text-white">Overview</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-400/[0.06] border border-emerald-400/15" title="Auto-refreshing every 15s">
                      <span className="relative flex w-1.5 h-1.5">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </span>
                      <span className="text-[10.5px] font-light text-emerald-300/90 tracking-wide">Live</span>
                    </div>
                    <button onClick={fetchAll} className="flex items-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-500 hover:text-zinc-200 text-[12px] font-light rounded-xl transition-all">
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Users", value: users.length, sub: "registered" },
                    { label: "Pending deposits", value: pendingDeposits, sub: "need review", alert: pendingDeposits > 0 },
                    { label: "Pending withdrawals", value: pendingWithdrawals, sub: "need action", alert: pendingWithdrawals > 0 },
                    { label: "Locked accounts", value: users.filter((u) => u.customLock).length, sub: "restricted" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-2xl p-5 border transition-colors ${s.alert && s.value > 0 ? "bg-amber-400/[0.04] border-amber-400/20" : "bg-[#1a1a1e] border-white/[0.05]"}`}>
                      <p className="text-[28px] font-light text-white leading-none mb-1.5">{s.value}</p>
                      <p className="text-[12px] font-light text-zinc-400">{s.label}</p>
                      <p className="text-[10px] font-light text-zinc-700 mt-0.5">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: "Recent Deposits", items: deposits.slice(0, 6), goTo: "deposits" as Tab },
                    { title: "Recent Withdrawals", items: withdrawals.slice(0, 6), goTo: "withdrawals" as Tab },
                  ].map(({ title, items, goTo }) => (
                    <div key={title} className="bg-[#1a1a1e] border border-white/[0.05] rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                        <p className="text-[13px] font-normal text-zinc-300">{title}</p>
                        <button onClick={() => setTab(goTo)} className="text-[11px] font-light text-zinc-600 hover:text-zinc-300 transition-colors">View all →</button>
                      </div>
                      {items.length === 0 ? (
                        <p className="text-zinc-700 text-[12px] font-light py-8 text-center">Nothing yet</p>
                      ) : items.map((item: DepositRow | WithdrawalRow) => (
                        <div key={item.id} className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04] last:border-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.status === "confirmed" || item.status === "completed" ? "bg-emerald-400" : item.status === "pending" ? "bg-amber-400" : "bg-red-400"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-light text-zinc-300 truncate">{item.userName}</p>
                            <p className="text-[10px] font-light text-zinc-600">{item.amount} {item.coin}</p>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ USERS ══ */}
            {tab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-light tracking-widest text-zinc-600 uppercase mb-1">Management</p>
                    <h1 className="text-xl font-light text-white">Users</h1>
                  </div>
                  <span className="text-[12px] font-light text-zinc-600">{users.length} total</span>
                </div>

                {users.length === 0 ? (
                  <div className="text-center py-24 text-zinc-700">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-[13px] font-light">No users yet</p>
                  </div>
                ) : (
                  <div className="bg-[#1a1a1e] border border-white/[0.05] rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.05]">
                      <div className="col-span-5"><span className="text-[10px] font-normal tracking-widest text-zinc-700 uppercase">User</span></div>
                      <div className="col-span-2 text-center"><span className="text-[10px] font-normal tracking-widest text-zinc-700 uppercase">Deposits</span></div>
                      <div className="col-span-2 text-center"><span className="text-[10px] font-normal tracking-widest text-zinc-700 uppercase">Withdrawals</span></div>
                      <div className="col-span-2"><span className="text-[10px] font-normal tracking-widest text-zinc-700 uppercase">Joined</span></div>
                      <div className="col-span-1" />
                    </div>

                    {users.map((user, i) => (
                      <motion.button
                        key={user.id}
                        onClick={() => openUserDrawer(user)}
                        className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors group ${i > 0 ? "border-t border-white/[0.04]" : ""}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-[13px] font-normal text-blue-400 shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Name + email */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[14px] font-normal text-zinc-200">{user.name}</p>
                            {user.customLock && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-normal uppercase tracking-widest bg-red-500/[0.08] text-red-400 border border-red-500/20">Locked</span>
                            )}
                          </div>
                          <p className="text-[11px] font-light text-zinc-600 truncate">{user.email}</p>
                        </div>

                        {/* Desktop stats */}
                        <div className="hidden md:flex items-center gap-8 shrink-0">
                          <span className="text-[13px] font-light text-zinc-500 w-8 text-center">{user.deposits.length}</span>
                          <span className="text-[13px] font-light text-zinc-500 w-8 text-center">{user.withdrawals.length}</span>
                          <span className="text-[12px] font-light text-zinc-600 w-20">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ DEPOSITS ══ */}
            {tab === "deposits" && (
              <motion.div key="deposits" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-light tracking-widest text-zinc-600 uppercase mb-1">Review queue</p>
                    <h1 className="text-xl font-light text-white">Deposits</h1>
                  </div>
                  <div className="flex gap-1.5">
                    {(["all", "pending"] as const).map((f) => (
                      <button key={f} onClick={() => setDepositFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-light transition-colors ${depositFilter === f ? "bg-white/[0.09] text-white" : "text-zinc-600 hover:text-zinc-300 border border-white/[0.05]"}`}>
                        {f === "all" ? `All (${deposits.length})` : `Pending (${pendingDeposits})`}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredDeposits.length === 0 ? (
                  <div className="text-center py-24 text-zinc-700">
                    <ArrowDownCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-[13px] font-light">No {depositFilter === "pending" ? "pending " : ""}deposits</p>
                  </div>
                ) : (
                  <div className="bg-[#1a1a1e] border border-white/[0.05] rounded-2xl overflow-hidden">
                    {/* Table header */}
                    <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/[0.05]">
                      {["User", "Amount", "Status", "Date", ""].map((h, i) => (
                        <div key={h} className={i === 0 ? "col-span-4" : i === 1 ? "col-span-2" : i === 2 ? "col-span-2" : i === 3 ? "col-span-2" : "col-span-2"}>
                          <span className="text-[10px] font-normal tracking-widest text-zinc-700 uppercase">{h}</span>
                        </div>
                      ))}
                    </div>

                    {filteredDeposits.map((dep, i) => (
                      <div key={dep.id} className={`${i > 0 ? "border-t border-white/[0.04]" : ""}`}>
                        {/* Desktop row */}
                        <div className="hidden md:grid grid-cols-12 gap-3 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors">
                          <div className="col-span-4 flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/15 flex items-center justify-center text-[11px] font-normal text-blue-400 shrink-0">
                              {dep.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-normal text-zinc-200 truncate">{dep.userName}</p>
                              <p className="text-[10px] font-light text-zinc-600 truncate">{dep.userEmail}</p>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[14px] font-light" style={{ color: COIN_COLORS[dep.coin] }}>{dep.amount}</p>
                            <p className="text-[10px] font-light text-zinc-600">{dep.coin}</p>
                          </div>
                          <div className="col-span-2"><StatusBadge status={dep.status} /></div>
                          <div className="col-span-2">
                            <p className="text-[11px] font-light text-zinc-600">{new Date(dep.date).toLocaleDateString()}</p>
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <button onClick={() => { setActionSheet({ kind: "deposit", id: dep.id }); setActionNote(""); }}
                              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-normal transition-colors ${
                                dep.status === "pending"
                                  ? "bg-amber-400/[0.07] border border-amber-400/20 text-amber-400 hover:bg-amber-400/[0.13]"
                                  : "bg-white/[0.04] border border-white/[0.07] text-zinc-500 hover:text-zinc-300"
                              }`}>
                              {dep.status === "pending" ? "Review" : "View"}
                            </button>
                          </div>
                        </div>

                        {/* Mobile row */}
                        <button
                          className="md:hidden w-full flex items-center gap-3.5 px-4 py-4 text-left active:bg-white/[0.04] transition-colors"
                          onClick={() => { setActionSheet({ kind: "deposit", id: dep.id }); setActionNote(""); }}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[14px]" style={{ backgroundColor: COIN_COLORS[dep.coin] + "18", color: COIN_COLORS[dep.coin] }}>
                            {dep.coin.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-[14px] font-normal text-zinc-200">{dep.amount} {dep.coin}</p>
                              <StatusBadge status={dep.status} />
                            </div>
                            <p className="text-[11px] font-light text-zinc-600 truncate">{dep.userName} · {new Date(dep.date).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ WITHDRAWALS ══ */}
            {tab === "withdrawals" && (
              <motion.div key="withdrawals" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-light tracking-widest text-zinc-600 uppercase mb-1">Processing queue</p>
                    <h1 className="text-xl font-light text-white">Withdrawals</h1>
                  </div>
                  <div className="flex gap-1.5">
                    {(["all", "active"] as const).map((f) => (
                      <button key={f} onClick={() => setWithdrawalFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-light transition-colors ${withdrawalFilter === f ? "bg-white/[0.09] text-white" : "text-zinc-600 hover:text-zinc-300 border border-white/[0.05]"}`}>
                        {f === "all" ? `All (${withdrawals.length})` : `Active (${pendingWithdrawals})`}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredWithdrawals.length === 0 ? (
                  <div className="text-center py-24 text-zinc-700">
                    <ArrowUpCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-[13px] font-light">No withdrawal requests</p>
                  </div>
                ) : (
                  <div className="bg-[#1a1a1e] border border-white/[0.05] rounded-2xl overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-white/[0.05]">
                      {["User", "Amount", "Status", "Date", ""].map((h, i) => (
                        <div key={h} className={i === 0 ? "col-span-4" : i === 1 ? "col-span-2" : i === 2 ? "col-span-2" : i === 3 ? "col-span-2" : "col-span-2"}>
                          <span className="text-[10px] font-normal tracking-widest text-zinc-700 uppercase">{h}</span>
                        </div>
                      ))}
                    </div>

                    {filteredWithdrawals.map((wd, i) => (
                      <div key={wd.id} className={`${i > 0 ? "border-t border-white/[0.04]" : ""}`}>
                        {/* Desktop row */}
                        <div className="hidden md:grid grid-cols-12 gap-3 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors">
                          <div className="col-span-4 flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/15 flex items-center justify-center text-[11px] font-normal text-blue-400 shrink-0">
                              {wd.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-normal text-zinc-200 truncate">{wd.userName}</p>
                              <p className="text-[10px] font-light text-zinc-600 font-mono truncate">{wd.address.slice(0, 16)}…</p>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[14px] font-light" style={{ color: COIN_COLORS[wd.coin] }}>{wd.amount}</p>
                            <p className="text-[10px] font-light text-zinc-600">{wd.coin}</p>
                          </div>
                          <div className="col-span-2"><StatusBadge status={wd.status} /></div>
                          <div className="col-span-2">
                            <p className="text-[11px] font-light text-zinc-600">{new Date(wd.requestDate).toLocaleDateString()}</p>
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <button onClick={() => { setActionSheet({ kind: "withdrawal", id: wd.id }); setActionNote(""); setActionFee(wd.networkFee != null ? String(wd.networkFee) : "0"); }}
                              className={`px-3.5 py-1.5 rounded-lg text-[11px] font-normal transition-colors ${
                                wd.status === "pending" || wd.status === "processing"
                                  ? "bg-white/[0.07] border border-white/[0.1] text-zinc-300 hover:bg-white/[0.11]"
                                  : "bg-white/[0.03] border border-white/[0.07] text-zinc-600 hover:text-zinc-400"
                              }`}>
                              {wd.status === "pending" || wd.status === "processing" ? "Manage" : "View"}
                            </button>
                          </div>
                        </div>

                        {/* Mobile row */}
                        <button
                          className="md:hidden w-full flex items-center gap-3.5 px-4 py-4 text-left active:bg-white/[0.04] transition-colors"
                          onClick={() => { setActionSheet({ kind: "withdrawal", id: wd.id }); setActionNote(""); setActionFee(wd.networkFee != null ? String(wd.networkFee) : "0"); }}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[14px]" style={{ backgroundColor: COIN_COLORS[wd.coin] + "18", color: COIN_COLORS[wd.coin] }}>
                            {wd.coin.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-[14px] font-normal text-zinc-200">{wd.amount} {wd.coin}</p>
                              <StatusBadge status={wd.status} />
                            </div>
                            <p className="text-[11px] font-light text-zinc-600 truncate">{wd.userName} · {new Date(wd.requestDate).toLocaleDateString()}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ══ MESSAGES ══ */}
            {tab === "messages" && (
              <motion.div key="messages" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-light tracking-widest text-zinc-600 uppercase mb-1">Support</p>
                    <h1 className="text-xl font-light text-white">Messages</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-400/[0.06] border border-emerald-400/15" title="Auto-refreshing every 15s">
                      <span className="relative flex w-1.5 h-1.5">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </span>
                      <span className="text-[10.5px] font-light text-emerald-300/90 tracking-wide">Live</span>
                    </div>
                    <button onClick={fetchAll} className="flex items-center gap-2 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] text-zinc-500 hover:text-zinc-200 text-[12px] font-light rounded-xl transition-all">
                      <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </button>
                  </div>
                </div>

                {conversations.length === 0 ? (
                  <div className="text-center py-24 text-zinc-700">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-[13px] font-light">No messages yet</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop side-by-side */}
                    <div className="hidden md:grid grid-cols-5 gap-3 h-[600px]">
                      <div className="col-span-2 bg-[#1a1a1e] border border-white/[0.05] rounded-2xl flex flex-col overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/[0.05]">
                          <p className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase">Chats · {conversations.length}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                          {conversations.map((c) => {
                            const last = c.messages[c.messages.length - 1];
                            const active = activeConvo === c.userId;
                            return (
                              <button key={c.userId} onClick={() => openConvo(c.userId, c.unread > 0)}
                                className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-white/[0.04] text-left transition-colors ${active ? "bg-blue-600/[0.08]" : "hover:bg-white/[0.03]"}`}
                              >
                                <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/15 flex items-center justify-center text-[12px] font-normal text-blue-400 shrink-0">
                                  {c.userName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <p className="text-[13px] font-normal text-zinc-200 truncate">{c.userName}</p>
                                    {c.unread > 0 && <span className="text-[9px] font-normal bg-blue-600 text-white rounded-full px-1.5 py-0.5 shrink-0 ml-2">{c.unread}</span>}
                                  </div>
                                  <p className="text-[10px] font-light text-zinc-600 truncate">{c.userEmail}</p>
                                  {last && <p className="text-[11px] font-light text-zinc-600 truncate mt-0.5">{last.from === "admin" ? "You: " : ""}{last.text}</p>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="col-span-3 bg-[#1a1a1e] border border-white/[0.05] rounded-2xl flex flex-col overflow-hidden">
                        {!activeConvo ? (
                          <div className="flex-1 flex items-center justify-center text-zinc-700">
                            <div className="text-center">
                              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p className="text-[12px] font-light">Select a conversation</p>
                            </div>
                          </div>
                        ) : (() => {
                          const convo = conversations.find((c) => c.userId === activeConvo);
                          if (!convo) return null;
                          return (
                            <>
                              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.05]">
                                <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/15 flex items-center justify-center text-[11px] font-normal text-blue-400">{convo.userName.charAt(0).toUpperCase()}</div>
                                <div>
                                  <p className="text-[13px] font-normal text-zinc-200">{convo.userName}</p>
                                  <p className="text-[10px] font-light text-zinc-600">{convo.userEmail}</p>
                                </div>
                              </div>
                              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                                {convo.messages.map((msg) => (
                                  <div key={msg.id} className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${msg.from === "admin" ? "bg-blue-600 text-white rounded-br-sm" : "bg-[#111113] border border-white/[0.07] text-zinc-300 rounded-bl-sm"}`}>
                                      {msg.from === "user" && <p className="text-[9px] font-normal text-zinc-600 mb-0.5">{convo.userName}</p>}
                                      <p className="font-light">{msg.text}</p>
                                      <p className={`text-[9px] mt-1 font-light ${msg.from === "admin" ? "text-blue-200/50" : "text-zinc-700"}`}>{new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                                    </div>
                                  </div>
                                ))}
                                <div ref={chatBottomRef} />
                              </div>
                              <div className="px-4 py-3 border-t border-white/[0.05] flex items-end gap-2">
                                <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendReply(); }} placeholder="Reply…"
                                  className="flex-1 px-3.5 py-2.5 bg-[#111113] border border-white/[0.07] rounded-xl text-white text-[12px] font-light placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/30 transition-colors"
                                />
                                <button onClick={sendReply} disabled={!replyText.trim() || sendingReply}
                                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
                                  {sendingReply ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Mobile list → thread */}
                    <div className="md:hidden">
                      <AnimatePresence mode="wait">
                        {mobileChatView === "list" ? (
                          <motion.div key="mobile-list" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
                            <div className="bg-[#1a1a1e] border border-white/[0.05] rounded-2xl overflow-hidden">
                              {conversations.map((c) => {
                                const last = c.messages[c.messages.length - 1];
                                return (
                                  <button key={c.userId} onClick={() => openConvo(c.userId, c.unread > 0)}
                                    className="w-full flex items-start gap-3.5 px-4 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] text-left transition-colors"
                                  >
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/15 flex items-center justify-center text-[13px] font-normal text-blue-400 shrink-0">{c.userName.charAt(0).toUpperCase()}</div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-[14px] font-normal text-zinc-200">{c.userName}</p>
                                        {c.unread > 0 && <span className="text-[9px] font-normal bg-blue-600 text-white rounded-full px-2 py-0.5 shrink-0 ml-2">{c.unread}</span>}
                                      </div>
                                      <p className="text-[11px] font-light text-zinc-600">{c.userEmail}</p>
                                      {last && <p className="text-[12px] font-light text-zinc-500 truncate mt-0.5">{last.from === "admin" ? "You: " : ""}{last.text}</p>}
                                    </div>
                                    <span className="text-zinc-700 text-lg shrink-0">›</span>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        ) : (() => {
                          const convo = conversations.find((c) => c.userId === activeConvo);
                          if (!convo) return null;
                          return (
                            <motion.div key="mobile-thread" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}
                              className="bg-[#1a1a1e] border border-white/[0.05] rounded-2xl overflow-hidden flex flex-col" style={{ height: "calc(100vh - 200px)" }}>
                              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.05]">
                                <button onClick={() => setMobileChatView("list")} className="text-zinc-500 hover:text-white transition-colors p-1 -ml-1"><ArrowLeft className="w-5 h-5" /></button>
                                <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/15 flex items-center justify-center text-[11px] font-normal text-blue-400">{convo.userName.charAt(0).toUpperCase()}</div>
                                <div>
                                  <p className="text-[13px] font-normal text-zinc-200">{convo.userName}</p>
                                  <p className="text-[10px] font-light text-zinc-600">{convo.userEmail}</p>
                                </div>
                              </div>
                              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                                {convo.messages.map((msg) => (
                                  <div key={msg.id} className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${msg.from === "admin" ? "bg-blue-600 text-white rounded-br-sm" : "bg-[#111113] border border-white/[0.07] text-zinc-300 rounded-bl-sm"}`}>
                                      {msg.from === "user" && <p className="text-[9px] font-normal text-zinc-600 mb-0.5">{convo.userName}</p>}
                                      <p className="font-light">{msg.text}</p>
                                      <p className={`text-[9px] mt-1 font-light ${msg.from === "admin" ? "text-blue-200/50" : "text-zinc-700"}`}>{new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                                    </div>
                                  </div>
                                ))}
                                <div ref={chatBottomRef} />
                              </div>
                              <div className="px-4 py-3 border-t border-white/[0.05] flex items-end gap-2">
                                <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendReply(); }} placeholder="Reply…"
                                  className="flex-1 px-3.5 py-2.5 bg-[#111113] border border-white/[0.07] rounded-xl text-white text-[12px] font-light placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/30"
                                />
                                <button onClick={sendReply} disabled={!replyText.trim() || sendingReply}
                                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
                                  {sendingReply ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
                                </button>
                              </div>
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ══ SETTINGS ══ */}
            {tab === "settings" && settings && (
              <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="text-[10px] font-light tracking-widest text-zinc-600 uppercase mb-1">Platform</p>
                    <h1 className="text-xl font-light text-white">Settings</h1>
                  </div>
                </div>

                <div className="max-w-2xl space-y-8">

                  {/* ─ Withdrawals section ─ */}
                  <div>
                    <p className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase mb-4">Withdrawals</p>
                    <div className="divide-y divide-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">

                      {/* Global lock row */}
                      <div className="px-5 py-4 flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${settings.globalWithdrawalLock ? "bg-red-500/10" : "bg-white/[0.04]"}`}>
                          {settings.globalWithdrawalLock ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4 text-zinc-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-normal text-zinc-200">Global withdrawal lock</p>
                          <p className="text-[11px] font-light text-zinc-600 mt-0.5">
                            {settings.globalWithdrawalLock ? <span className="text-red-400">All withdrawals are locked</span> : "Withdrawals are currently open"}
                          </p>
                        </div>
                        <label className="relative cursor-pointer shrink-0">
                          <input type="checkbox" className="sr-only peer" checked={settings.globalWithdrawalLock}
                            onChange={(e) => setSettings({ ...settings, globalWithdrawalLock: e.target.checked })} />
                          <div className="w-10 h-5 bg-white/[0.07] rounded-full peer peer-checked:bg-red-600/60 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                        </label>
                      </div>

                      {/* Lock reason — only when locked */}
                      <AnimatePresence>
                        {settings.globalWithdrawalLock && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-5 py-4">
                              <label className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase block mb-2">Reason shown to users</label>
                              <input type="text" value={settings.globalWithdrawalLockReason}
                                onChange={(e) => setSettings({ ...settings, globalWithdrawalLockReason: e.target.value })}
                                placeholder="e.g. Maintenance in progress…"
                                className="w-full px-4 py-2.5 bg-[#111113] border border-white/[0.07] rounded-xl text-white text-[13px] font-light placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/30"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Default lock period */}
                      <div className="px-5 py-4 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-normal text-zinc-200">Default lock period</p>
                          <p className="text-[11px] font-light text-zinc-600 mt-0.5">Days after first deposit before withdrawals open. 0 = immediate.</p>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <input type="number" min="0" value={settings.defaultWithdrawalLockDays}
                            onChange={(e) => setSettings({ ...settings, defaultWithdrawalLockDays: parseInt(e.target.value) || 0 })}
                            className="w-16 px-3 py-1.5 bg-[#111113] border border-white/[0.07] rounded-lg text-white text-[13px] font-light text-center focus:outline-none focus:border-blue-500/40 [appearance:textfield]"
                          />
                          <span className="text-[12px] font-light text-zinc-600">days</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─ Deposit wallets section ─ */}
                  <div>
                    <p className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase mb-4">Deposit Wallets</p>
                    <div className="divide-y divide-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
                      {COINS.map((coin) => (
                        <div key={coin} className="px-5 py-4 flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-normal shrink-0 border border-white/[0.06]"
                            style={{ color: COIN_COLORS[coin], backgroundColor: COIN_COLORS[coin] + "12" }}>
                            {coin.slice(0, 3)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-normal text-zinc-400 mb-1.5">{coin}</p>
                            <input type="text" value={settings.adminWallets[coin] || ""}
                              onChange={(e) => setSettings({ ...settings, adminWallets: { ...settings.adminWallets, [coin]: e.target.value } })}
                              placeholder="Wallet address"
                              className="w-full px-0 py-0 bg-transparent text-white text-[12px] font-mono font-light placeholder:text-zinc-700 focus:outline-none border-b border-transparent focus:border-blue-500/30 transition-colors"
                            />
                          </div>
                          <Wallet className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ─ Platform info section ─ */}
                  <div>
                    <p className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase mb-4">Platform Info</p>
                    <div className="divide-y divide-white/[0.05] border border-white/[0.05] rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-normal text-zinc-400 mb-1.5">Site name</p>
                          <input type="text" value={settings.siteName}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            placeholder="VaultX"
                            className="w-full px-0 py-0 bg-transparent text-white text-[13px] font-light placeholder:text-zinc-700 focus:outline-none border-b border-transparent focus:border-blue-500/30 transition-colors"
                          />
                        </div>
                      </div>
                      <div className="px-5 py-4 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-normal text-zinc-400 mb-1.5">Support email</p>
                          <input type="email" value={settings.adminEmail}
                            onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                            placeholder="support@example.com"
                            className="w-full px-0 py-0 bg-transparent text-white text-[13px] font-light placeholder:text-zinc-700 focus:outline-none border-b border-transparent focus:border-blue-500/30 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <button onClick={saveSettings} disabled={savingSettings}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-normal rounded-xl transition-colors">
                    {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save settings
                  </button>

                  {/* ─ Notification test ─ */}
                  <div className="bg-[#1a1a1e] border border-white/[0.05] rounded-xl p-5">
                    <p className="text-[10px] font-normal tracking-widest text-zinc-600 uppercase mb-1">Notification test</p>
                    <p className="text-[11px] font-light text-zinc-600 mb-4">
                      Send a real test email / SMS and see the exact result — use this to confirm your Resend &amp; TextBelt keys work.
                    </p>
                    <div className="space-y-2.5">
                      <div className="flex gap-2">
                        <input type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="flex-1 min-w-0 px-3 py-2 bg-[#111113] border border-white/[0.07] rounded-lg text-white text-[13px] focus:outline-none focus:border-blue-500/30 placeholder:text-zinc-700" />
                        <button onClick={() => runTest("email")} disabled={testing !== null}
                          className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 text-[12px] font-normal rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0">
                          {testing === "email" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Test email
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input type="tel" value={testPhone} onChange={(e) => setTestPhone(e.target.value)}
                          placeholder="+1 555 000 0000"
                          className="flex-1 min-w-0 px-3 py-2 bg-[#111113] border border-white/[0.07] rounded-lg text-white text-[13px] focus:outline-none focus:border-blue-500/30 placeholder:text-zinc-700" />
                        <button onClick={() => runTest("sms")} disabled={testing !== null}
                          className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-200 text-[12px] font-normal rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0">
                          {testing === "sms" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                          Test SMS
                        </button>
                      </div>
                      {testResult && (
                        <div className={`px-3 py-2.5 rounded-lg text-[12px] font-light ${
                          testResult.ok
                            ? "bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-300"
                            : "bg-red-500/[0.08] border border-red-500/20 text-red-300"
                        }`}>
                          {testResult.msg}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─ Danger zone ─ */}
                  <div className="bg-red-500/[0.04] border border-red-500/15 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <p className="text-[13px] font-normal text-red-300">Danger zone — clear all data</p>
                    </div>
                    <p className="text-[11px] font-light text-zinc-600 mb-3 leading-relaxed">
                      Permanently deletes every user account, deposit, withdrawal, chat message and verification
                      code. Admin accounts and platform settings are kept. This cannot be undone.
                    </p>
                    <button
                      onClick={() => { if (resetConfirm) runReset(); else setResetConfirm(true); }}
                      disabled={resetting}
                      className={`w-full py-2.5 rounded-xl text-[12px] font-normal transition-colors flex items-center justify-center gap-2 ${
                        resetConfirm
                          ? "bg-red-600 hover:bg-red-500 text-white"
                          : "bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/15"
                      }`}
                    >
                      {resetting
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                      {resetting ? "Clearing…" : resetConfirm ? "Tap again to permanently clear everything" : "Clear all platform data"}
                    </button>
                    {resetConfirm && !resetting && (
                      <button onClick={() => setResetConfirm(false)}
                        className="w-full mt-2 py-1.5 text-[11px] font-light text-zinc-600 hover:text-zinc-400 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111113]/95 backdrop-blur-xl border-t border-white/[0.06] px-2 pb-safe">
        <div className="flex items-stretch">
          {NAV.map((item) => (
            <button key={item.id} onClick={() => { setTab(item.id); setMobileChatView("list"); }}
              className={`flex-1 flex flex-col items-center gap-1 pt-3 pb-4 relative transition-colors ${tab === item.id ? "text-blue-400" : "text-zinc-600 hover:text-zinc-400"}`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] rounded-full text-[8px] font-normal flex items-center justify-center px-1 ${
                    item.id === "deposits" || item.id === "withdrawals" ? "bg-amber-400 text-black" : "bg-blue-600 text-white"
                  }`}>{item.badge > 9 ? "9+" : item.badge}</span>
                )}
              </div>
              <span className="text-[9px] font-light tracking-wide">{item.label}</span>
              {tab === item.id && <motion.div layoutId="bottomNav" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-500" />}
            </button>
          ))}
        </div>
      </nav>

      {/* ── User Drawer ── */}
      <AnimatePresence>
        {userDrawer && drawerUser && drawerEdit && (
          <UserDrawer
            user={drawerUser}
            edit={drawerEdit}
            onClose={() => setUserDrawer(null)}
            onChangeBalance={(coin, val) => setUserEdits((p) => ({ ...p, [userDrawer]: { ...p[userDrawer], balance: { ...p[userDrawer].balance, [coin]: val } } }))}
            onChangeEarnings={(coin, val) => setUserEdits((p) => ({ ...p, [userDrawer]: { ...p[userDrawer], earnings: { ...p[userDrawer].earnings, [coin]: val } } }))}
            onChangeDate={(val) => setUserEdits((p) => ({ ...p, [userDrawer]: { ...p[userDrawer], withdrawalUnlockDate: val } }))}
            onChangeLock={(val) => setUserEdits((p) => ({ ...p, [userDrawer]: { ...p[userDrawer], customLock: val } }))}
            onSave={() => saveUser(userDrawer)}
            onDelete={() => deleteUserAction(userDrawer)}
            saving={savingUser === userDrawer}
            deleting={deletingUser === userDrawer}
          />
        )}
      </AnimatePresence>

      {/* ── Action Sheet ── */}
      <AnimatePresence>
        {actionSheet && actionItem && (
          <ActionSheet
            item={actionItem}
            kind={actionSheet.kind}
            note={actionNote}
            onChangeNote={setActionNote}
            fee={actionFee}
            onChangeFee={setActionFee}
            onAction={(action) => {
              if (actionSheet.kind === "deposit") {
                handleDepositAction(actionItem as DepositRow, action, actionNote);
              } else {
                handleWithdrawalAction(actionItem as WithdrawalRow, action, actionNote, actionFee);
              }
            }}
            onClose={() => { setActionSheet(null); setActionNote(""); setActionFee(""); }}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" msg={toast.msg} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
