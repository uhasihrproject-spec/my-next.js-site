"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Mail, KeyRound, Loader2, Lock, ShieldCheck,
  Eye, EyeOff, ArrowLeft, ArrowRight, Check, AlertCircle, Fingerprint,
} from "lucide-react";
import Logo from "@/components/Logo";
import Recaptcha, { type RecaptchaHandle } from "@/components/Recaptcha";

type Step = "email" | "verify" | "done";

const fieldCls =
  "w-full pl-10 pr-3.5 py-2.5 bg-[#0c0c0d] border border-white/[0.08] rounded-lg text-white text-[13px] placeholder-zinc-700 focus:outline-none focus:border-blue-500/40 transition-colors";

function CodeBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            const arr = (value + "      ").slice(0, 6).split("");
            arr[i] = d || " ";
            onChange(arr.join("").replace(/ /g, "").slice(0, 6));
            if (d && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => { if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus(); }}
          onPaste={(e) => {
            e.preventDefault();
            const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (t) { onChange(t); refs.current[Math.min(t.length, 5)]?.focus(); }
          }}
          className="w-11 py-2.5 text-center text-[20px] font-light text-white bg-[#0c0c0d] border border-white/[0.1] rounded-lg focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      ))}
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const captchaRef = useRef<RecaptchaHandle>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRequired = !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    const recaptchaToken = captchaRef.current?.getToken() || "";
    if (captchaRequired && !recaptchaToken) {
      setError("Please tick the “I’m not a robot” box.");
      return;
    }
    setError(""); setBusy(true);
    try {
      const r = await fetch("/api/auth/reset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", email, recaptchaToken }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "Couldn't start the reset");
        captchaRef.current?.reset();
        setCaptchaToken("");
        return;
      }
      setDevCode(d.devCode || "");
      setEmailSent(!!d.sent);
      setStep("verify");
    } catch { setError("Network error. Please try again."); }
    finally { setBusy(false); }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.length !== 6) { setError("Enter the 6-digit code"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/reset", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", email, code, password }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Reset failed"); return; }
      setStep("done");
    } catch { setError("Network error. Please try again."); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="flex items-center gap-2 mb-10">
        <Logo size={28} />
        <span className="font-normal text-white text-[15px]">VaultX</span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-400/[0.05] border border-emerald-400/15 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <p className="text-[11px] font-light text-emerald-300/80">
            Identity-verified reset · a code is emailed to your account address
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/[0.07] border border-red-500/20 text-red-400 text-[12px] font-light">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step: email */}
          {step === "email" && (
            <motion.form key="email" onSubmit={requestCode}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="w-12 h-12 rounded-xl bg-blue-500/[0.1] border border-blue-500/20 flex items-center justify-center mb-5">
                <Fingerprint className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-[22px] font-light tracking-tight text-white mb-1.5">Reset your password</h1>
              <p className="text-[13px] font-light text-zinc-500 mb-6">
                Enter your account email. We&apos;ll send a one-time verification code to that address.
              </p>
              <div className="relative mb-4">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="Email address" className={fieldCls} />
              </div>
              <div className="mb-4">
                <Recaptcha ref={captchaRef} onChange={setCaptchaToken} theme="dark" />
              </div>
              <button type="submit" disabled={busy || (captchaRequired && !captchaToken)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-lg transition-colors disabled:opacity-50">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Send verification code
              </button>
            </motion.form>
          )}

          {/* Step: verify + new password */}
          {step === "verify" && (
            <motion.form key="verify" onSubmit={resetPassword}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="w-12 h-12 rounded-xl bg-blue-500/[0.1] border border-blue-500/20 flex items-center justify-center mb-5">
                <KeyRound className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-[22px] font-light tracking-tight text-white mb-1.5">Verify &amp; set new password</h1>
              <p className="text-[13px] font-light text-zinc-500 mb-5">
                Enter the 6-digit code sent to <span className="text-zinc-300">{email}</span>. Check your inbox (and spam).
              </p>

              <CodeBoxes value={code} onChange={setCode} />

              {emailSent && (
                <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-400/[0.06] border border-emerald-400/15">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <p className="text-[11px] font-light text-emerald-300/80">Reset code emailed — it may take a few seconds.</p>
                </div>
              )}
              {devCode && (
                <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-400/[0.06] border border-amber-400/15">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-light text-amber-300/80 leading-relaxed">
                    We couldn&apos;t send the email — use this code to continue:{" "}
                    <span className="font-mono font-normal text-amber-200">{devCode}</span>.
                  </p>
                </div>
              )}

              <div className="relative mt-5">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  required placeholder="New password" className={`${fieldCls} pr-10`} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button type="submit" disabled={busy}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-lg transition-colors disabled:opacity-50">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Update password
              </button>
              <button type="button" onClick={() => { setStep("email"); setCode(""); setPassword(""); }}
                className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 text-zinc-600 hover:text-zinc-300 text-[12px] font-light transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Use a different email
              </button>
            </motion.form>
          )}

          {/* Step: done */}
          {step === "done" && (
            <motion.div key="done"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 13, stiffness: 240 }}
                className="w-14 h-14 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7 text-emerald-400" strokeWidth={2} />
              </motion.div>
              <h1 className="text-[22px] font-light tracking-tight text-white mb-2">Password updated</h1>
              <p className="text-[13px] font-light text-zinc-500 mb-7">
                Your password has been changed. Sign in with your new password.
              </p>
              <button onClick={() => router.push("/login")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-lg transition-colors">
                Go to sign in <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== "done" && (
          <p className="mt-7 text-center text-[12px] font-light text-zinc-600">
            Remembered it?{" "}
            <Link href="/login" className="text-white hover:text-zinc-300 transition-colors">Back to sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
