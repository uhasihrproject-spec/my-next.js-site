"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Loader2, Lock, ShieldCheck,
  Check, Mail, KeyRound, ArrowRight, Snowflake, Fingerprint,
} from "lucide-react";
import Logo from "@/components/Logo";
import { refreshAuthUser } from "@/components/useAuthUser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      await refreshAuthUser();
      router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldCls = "w-full pl-10 pr-3.5 py-2.5 bg-[#0c0c0d] border border-white/[0.08] rounded-lg text-white text-[13px] placeholder-zinc-700 focus:outline-none focus:border-blue-500/40 transition-colors";

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex">

      {/* ─── Left security panel (desktop) ─── */}
      <aside className="hidden lg:flex flex-col w-[42%] max-w-lg border-r border-white/[0.05] bg-[#0c0c0d] px-12 py-12">
        <Link href="/" className="flex items-center gap-2.5 mb-auto">
          <Logo size={28} />
          <span className="font-normal text-white text-[15px]">VaultX</span>
        </Link>

        <div className="my-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-400/[0.06] border border-emerald-400/15 mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-normal text-emerald-400/90 tracking-wide">Protected sign-in</span>
          </div>
          <h2 className="text-[28px] font-light leading-tight tracking-tight mb-4">
            Welcome back to<br />the secure vault.
          </h2>
          <p className="text-[13px] font-light text-zinc-500 leading-relaxed mb-9 max-w-sm">
            Your session is encrypted end-to-end. We never store your password in readable form.
          </p>

          <div className="space-y-4">
            {[
              { Icon: Lock, title: "Encrypted session", desc: "TLS 1.3 secures every request between you and VaultX." },
              { Icon: Snowflake, title: "Funds in cold storage", desc: "Assets stay offline — a sign-in never exposes them." },
              { Icon: Fingerprint, title: "Login monitoring", desc: "Unusual activity is flagged and challenged automatically." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[13px] font-normal text-zinc-200">{title}</p>
                  <p className="text-[12px] font-light text-zinc-600 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] font-light text-zinc-700 mt-auto">
          © 2015 - {new Date().getFullYear()} VaultX. Protected by TLS encryption.
        </p>
      </aside>

      {/* ─── Form ─── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <Logo size={28} />
            <span className="font-normal text-white text-[15px]">VaultX</span>
          </Link>

          <h1 className="text-[24px] font-light tracking-tight text-white mb-1">Sign in</h1>
          <p className="text-[13px] font-light text-zinc-500 mb-6">Access your secure VaultX account.</p>

          {/* Secure connection strip */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-400/[0.05] border border-emerald-400/15 mb-6">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <p className="text-[11px] font-light text-emerald-300/80">
              Secure connection · 256-bit encrypted
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/[0.07] border border-red-500/20 text-red-400 text-[12px] font-light">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="Email address" className={fieldCls} />
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
              <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Password" className={`${fieldCls} pr-10`} />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button type="button" onClick={() => setRemember(!remember)} className="flex items-center gap-2 group">
                <span className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border transition-colors ${
                  remember ? "bg-blue-600 border-blue-600" : "border-white/15 group-hover:border-white/30"
                }`}>
                  {remember && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
                <span className="text-[12px] font-light text-zinc-500">Trust this device</span>
              </button>
              <Link href="/forgot-password" className="text-[12px] font-light text-blue-400 hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-lg transition-colors disabled:opacity-50 mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {loading ? "Verifying…" : "Sign in securely"}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] font-light text-zinc-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white hover:text-zinc-300 transition-colors inline-flex items-center gap-1">
              Create one <ArrowRight className="w-3 h-3" />
            </Link>
          </p>

          <p className="mt-8 text-center text-[10px] font-light text-zinc-700 leading-relaxed">
            For your security, never share your password. VaultX support will never ask for it.
          </p>
        </div>
      </main>
    </div>
  );
}
