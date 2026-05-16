"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Eye, EyeOff, Loader2, ShieldCheck,
  Check, User, Mail, Phone, Globe, Calendar, KeyRound,
  ArrowRight, ArrowLeft, AlertCircle, Snowflake, ScanFace,
  Camera, RotateCw, MessageSquareText,
} from "lucide-react";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Switzerland", "Singapore", "Japan",
  "United Arab Emirates", "South Africa", "Nigeria", "Kenya", "Ghana",
  "India", "Brazil", "Mexico", "Spain", "Italy", "Other",
];

type Step = "details" | "phone" | "face";
const STEP_LIST: { id: Step; label: string; sub: string }[] = [
  { id: "details", label: "Personal details", sub: "Tell us about yourself" },
  { id: "phone",   label: "Phone verification", sub: "Confirm your number" },
  { id: "face",    label: "Liveness check", sub: "Prove you're really there" },
];

const fieldCls =
  "w-full pl-10 pr-3.5 py-2.5 bg-[#0c0c0d] border border-white/[0.08] rounded-lg text-white text-[13px] placeholder-zinc-700 focus:outline-none focus:border-blue-500/40 transition-colors";

const slide = {
  initial: (d: number) => ({ x: d * 40, opacity: 0 }),
  animate: { x: 0, opacity: 1, transition: { duration: 0.25, ease: "easeOut" as const } },
  exit: (d: number) => ({ x: d * -40, opacity: 0, transition: { duration: 0.18 } }),
};

/* ════════ 6-digit code input ════════ */
function CodeInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  function setDigit(i: number, d: string) {
    const digit = d.replace(/\D/g, "").slice(-1);
    const arr = (value + "      ").slice(0, 6).split("");
    arr[i] = digit || " ";
    const next = arr.join("").replace(/ /g, "").slice(0, 6);
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  }
  return (
    <div className="flex gap-2 justify-center">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[i] || ""}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => { if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.focus(); }}
          onPaste={(e) => {
            e.preventDefault();
            const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (txt) { onChange(txt); refs.current[Math.min(txt.length, 5)]?.focus(); }
          }}
          className="w-11 h-13 py-2.5 text-center text-[20px] font-light text-white bg-[#0c0c0d] border border-white/[0.1] rounded-lg focus:outline-none focus:border-blue-500/50 disabled:opacity-50 transition-colors"
        />
      ))}
    </div>
  );
}

/* ════════ Step 1 — Details ════════ */
function DetailsStep({ form, setForm, agree, setAgree, consent, setConsent, dir, onNext }: {
  form: Record<string, string>;
  setForm: (f: Record<string, string>) => void;
  agree: boolean; setAgree: (v: boolean) => void;
  consent: boolean; setConsent: (v: boolean) => void;
  dir: number; onNext: () => void;
}) {
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const strength = (() => {
    const p = form.password || "";
    if (!p) return 0;
    return [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Strong", "Very strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"][strength];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.phone || !form.country || !form.dob) {
      setError("Please complete every field — all details are required for verification."); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError("Enter a valid email address"); return; }
    {
      const birth = new Date(form.dob);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      if (isNaN(age)) { setError("Please enter a valid date of birth"); return; }
      if (age < 18) { setError("You must be 18 or older to open an account. Come back when you're 18!"); return; }
    }
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if ((form.password || "").length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!agree) { setError("You must accept the Terms of Service and Privacy Policy"); return; }
    if (!consent) { setError("Identity verification consent is required to open an account"); return; }
    onNext();
  }

  return (
    <motion.form custom={dir} variants={slide} initial="initial" animate="animate" exit="exit"
      onSubmit={submit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/[0.07] border border-red-500/20 text-red-400 text-[12px] font-light">
          {error}
        </div>
      )}

      <div>
        <p className="text-[10px] font-normal tracking-[0.18em] text-zinc-600 uppercase mb-3">Personal details</p>
        <div className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input type="text" value={form.name} onChange={set("name")} placeholder="Full legal name" className={fieldCls} />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input type="email" value={form.email} onChange={set("email")} placeholder="Email address" className={fieldCls} />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input type="tel" value={form.phone} onChange={set("phone")} placeholder="Phone (with country code, e.g. +1…)" className={fieldCls} />
          </div>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 z-10" />
            <select value={form.country} onChange={set("country")}
              className={`${fieldCls} appearance-none cursor-pointer ${form.country ? "text-white" : "text-zinc-700"}`}>
              <option value="" disabled>Country of residence</option>
              {COUNTRIES.map((c) => <option key={c} value={c} className="bg-[#0c0c0d] text-white">{c}</option>)}
            </select>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 z-10" />
            <input type="date" value={form.dob} onChange={set("dob")}
              className={`${fieldCls} ${form.dob ? "text-white" : "text-zinc-700"} [color-scheme:dark]`} />
            <span className="absolute -top-2 left-9 px-1 bg-[#0a0a0b] text-[9px] font-light text-zinc-600">Date of birth</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-normal tracking-[0.18em] text-zinc-600 uppercase mb-3">Account security</p>
        <div className="space-y-3">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input type={show ? "text" : "password"} value={form.password} onChange={set("password")}
              placeholder="Create a password" className={`${fieldCls} pr-10`} />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {form.password && (
            <div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-white/[0.07]"}`} />
                ))}
              </div>
              <p className="text-[10px] font-light text-zinc-600 mt-1.5">
                Strength: <span className="text-zinc-400">{strengthLabel}</span> · use 8+ chars, a number &amp; a symbol
              </p>
            </div>
          )}
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
            <input type="password" value={form.confirm} onChange={set("confirm")} placeholder="Confirm password"
              className={`${fieldCls} ${form.confirm && form.confirm !== form.password ? "border-red-500/40" : ""}`} />
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {[
          { state: agree, toggle: () => setAgree(!agree), node: <>I agree to the <Link href="/terms" target="_blank" className="text-blue-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="text-blue-400 hover:underline">Privacy Policy</Link>.</> },
          { state: consent, toggle: () => setConsent(!consent), node: <>I consent to phone &amp; identity verification of the details I&apos;ve provided.</> },
        ].map(({ state, toggle, node }, i) => (
          <button key={i} type="button" onClick={toggle} className="flex items-start gap-2.5 text-left w-full group">
            <span className={`w-4 h-4 rounded mt-0.5 shrink-0 flex items-center justify-center border transition-colors ${
              state ? "bg-blue-600 border-blue-600" : "border-white/15 group-hover:border-white/30"
            }`}>
              {state && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </span>
            <span className="text-[11.5px] font-light text-zinc-500 leading-relaxed">{node}</span>
          </button>
        ))}
      </div>

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-lg transition-colors">
        Continue to verification <ArrowRight className="w-4 h-4" />
      </button>
    </motion.form>
  );
}

/* ════════ Step 2 — Phone OTP ════════ */
function PhoneStep({ phone, dir, onBack, onVerified }: {
  phone: string; dir: number; onBack: () => void; onVerified: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [smsNote, setSmsNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const sendCode = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/auth/otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Couldn't send the code"); return; }
      setSent(true);
      setCode("");
      setDevCode(d.devCode || "");
      setSmsSent(!!d.sms);
      setSmsNote(d.smsNote || "");
      setCooldown(30);
    } catch { setError("Network error. Please try again."); }
    finally { setBusy(false); }
  }, [phone]);

  const verify = useCallback(async (value: string) => {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/auth/otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone, code: value }),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Incorrect code"); setBusy(false); return; }
      onVerified();
    } catch { setError("Network error. Please try again."); setBusy(false); }
  }, [phone, onVerified]);

  useEffect(() => {
    if (code.length === 6 && !busy) verify(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <motion.div custom={dir} variants={slide} initial="initial" animate="animate" exit="exit">
      <div className="w-12 h-12 rounded-xl bg-blue-500/[0.1] border border-blue-500/20 flex items-center justify-center mb-5">
        <MessageSquareText className="w-5 h-5 text-blue-400" />
      </div>
      <h2 className="text-[20px] font-light text-white mb-1.5">Verify your phone</h2>
      <p className="text-[13px] font-light text-zinc-500 mb-6">
        {sent
          ? <>Enter the 6-digit code we sent to <span className="text-zinc-300">{phone}</span>.</>
          : <>We&apos;ll text a one-time code to <span className="text-zinc-300">{phone}</span> to confirm your number.</>}
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/[0.07] border border-red-500/20 text-red-400 text-[12px] font-light">
          {error}
        </div>
      )}

      {!sent ? (
        <button onClick={sendCode} disabled={busy}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-normal rounded-lg transition-colors">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareText className="w-4 h-4" />}
          Send verification code
        </button>
      ) : (
        <>
          <CodeInput value={code} onChange={setCode} disabled={busy} />

          {smsSent && (
            <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-400/[0.06] border border-emerald-400/15">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <p className="text-[11px] font-light text-emerald-300/80">
                Code texted to <span className="text-emerald-200">{phone}</span> — it may take a few seconds.
              </p>
            </div>
          )}

          {devCode && (
            <div className="mt-4 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-400/[0.06] border border-amber-400/15">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] font-light text-amber-300/80 leading-relaxed">
                We couldn&apos;t text your phone{smsNote ? ` (${smsNote})` : ""}. Use this code to continue:{" "}
                <span className="font-mono font-normal text-amber-200">{devCode}</span>
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 mt-5 text-[12px] font-light">
            {busy && code.length === 6
              ? <span className="text-zinc-500 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying…</span>
              : cooldown > 0
                ? <span className="text-zinc-600">Resend code in 0:{String(cooldown).padStart(2, "0")}</span>
                : <button onClick={sendCode} disabled={busy} className="text-blue-400 hover:underline">Resend code</button>}
          </div>
        </>
      )}

      <button onClick={onBack}
        className="w-full mt-6 flex items-center justify-center gap-1.5 py-2.5 text-zinc-600 hover:text-zinc-300 text-[12px] font-light transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to details
      </button>
    </motion.div>
  );
}

/* ════════ Step 3 — Liveness check (real motion detection) ════════
   This genuinely analyses the camera: it samples frames and measures
   pixel motion in the face region. Each prompt only completes when real
   movement is detected — a static photo produces ~zero motion and will
   not pass. No external API or model needed.                          */
const PROMPTS: { label: string; need: number }[] = [
  { label: "Center your face inside the circle", need: 45 },
  { label: "Blink your eyes a few times", need: 110 },
  { label: "Slowly turn your head left, then right", need: 150 },
];

function FaceStep({ dir, registering, registerError, onBack, onComplete, onRetryRegister }: {
  dir: number; registering: boolean; registerError: string;
  onBack: () => void; onComplete: () => void; onRetryRegister: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sampleRef = useRef<HTMLCanvasElement>(null);
  const captureRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const prevFrame = useRef<Uint8ClampedArray | null>(null);
  const motionAcc = useRef(0);

  const [phase, setPhase] = useState<"intro" | "running" | "done">("intro");
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [promptFill, setPromptFill] = useState(0);
  const [liveMotion, setLiveMotion] = useState(0);
  const [hint, setHint] = useState("");
  const [photo, setPhoto] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  /* Camera setup */
  useEffect(() => {
    let cancelled = false;
    setCamError(false); setCamReady(false);
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCamReady(true);
      } catch {
        if (!cancelled) setCamError(true);
      }
    })();
    return () => { cancelled = true; stopCamera(); };
  }, [retryKey, stopCamera]);

  /* Final photo capture */
  const capture = useCallback(() => {
    const v = videoRef.current, c = captureRef.current;
    if (v && c && v.videoWidth) {
      const size = Math.min(v.videoWidth, v.videoHeight);
      c.width = 260; c.height = 260;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(v, (v.videoWidth - size) / 2, (v.videoHeight - size) / 2, size, size, 0, 0, 260, 260);
        setPhoto(c.toDataURL("image/jpeg", 0.82));
      }
    }
    stopCamera();
    setPhase("done");
    setTimeout(() => onComplete(), 1400);
  }, [stopCamera, onComplete]);

  /* Motion sampling loop — measures real frame-to-frame movement */
  useEffect(() => {
    if (phase !== "running" || !camReady) return;
    let active = true, raf = 0, last = 0;
    const N = 64;
    const sctx = sampleRef.current?.getContext("2d", { willReadFrequently: true });
    prevFrame.current = null;

    function tick(t: number) {
      if (!active) return;
      if (t - last > 85) {
        last = t;
        const v = videoRef.current;
        if (v && sctx && v.videoWidth) {
          const size = Math.min(v.videoWidth, v.videoHeight) * 0.62;
          sctx.drawImage(v, (v.videoWidth - size) / 2, (v.videoHeight - size) / 2, size, size, 0, 0, N, N);
          const cur = sctx.getImageData(0, 0, N, N).data;
          const prev = prevFrame.current;
          if (prev) {
            let diff = 0;
            for (let i = 0; i < cur.length; i += 4) {
              const a = cur[i] + cur[i + 1] + cur[i + 2];
              const b = prev[i] + prev[i + 1] + prev[i + 2];
              const dd = a > b ? a - b : b - a;
              if (dd > 26) diff += dd; // ignore sensor noise
            }
            const score = diff / (N * N);
            setLiveMotion(score);
            if (score > 6) motionAcc.current += score;
          }
          prevFrame.current = cur;
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { active = false; cancelAnimationFrame(raf); };
  }, [phase, camReady]);

  /* Prompt progression — advances only on detected motion */
  useEffect(() => {
    if (phase !== "running") return;
    motionAcc.current = 0;
    setPromptFill(0); setHint("");
    const need = PROMPTS[promptIndex].need;
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += 200;
      setPromptFill(Math.min(1, motionAcc.current / need));
      if (motionAcc.current >= need) {
        clearInterval(id);
        if (promptIndex >= PROMPTS.length - 1) capture();
        else setPromptIndex((i) => i + 1);
      } else if (elapsed >= 6000) {
        setHint("Keep your face centred and well lit, then follow the prompt.");
      }
    }, 200);
    return () => clearInterval(id);
  }, [phase, promptIndex, capture]);

  const progress = phase === "done"
    ? 1
    : phase === "running"
      ? (promptIndex + promptFill) / PROMPTS.length
      : 0;
  const RING = 2 * Math.PI * 130;

  return (
    <motion.div custom={dir} variants={slide} initial="initial" animate="animate" exit="exit">
      <div className="w-12 h-12 rounded-xl bg-blue-500/[0.1] border border-blue-500/20 flex items-center justify-center mb-5">
        <ScanFace className="w-5 h-5 text-blue-400" />
      </div>
      <h2 className="text-[20px] font-light text-white mb-1.5">Liveness check</h2>
      <p className="text-[13px] font-light text-zinc-500 mb-6">
        We analyse your camera to confirm you&apos;re a real, present person. Nothing is uploaded — it runs on your device.
      </p>

      <div className="flex flex-col items-center">
        <div className="relative w-[280px] h-[280px]">
          <svg className="absolute inset-0 -rotate-90" width="280" height="280" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r="130" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <motion.circle
              cx="140" cy="140" r="130" fill="none"
              stroke={phase === "done" ? "#34d399" : "#3b82f6"} strokeWidth="3" strokeLinecap="round"
              strokeDasharray={RING}
              animate={{ strokeDashoffset: RING * (1 - progress) }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-[18px] rounded-full overflow-hidden bg-[#0c0c0d] border border-white/[0.06]">
            {camError ? (
              <div className="w-full h-full flex flex-col items-center justify-center px-6 text-center">
                <Camera className="w-7 h-7 text-zinc-700 mb-2" />
                <p className="text-[12px] font-light text-zinc-500">Camera unavailable</p>
                <p className="text-[10px] font-light text-zinc-700 mt-1">Allow camera access to continue.</p>
              </div>
            ) : (
              <>
                <video ref={videoRef} muted playsInline
                  className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
                {photo && phase === "done" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="scan" className="absolute inset-0 w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
                )}
                {!camReady && !camError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>
          {phase === "done" && !registering && !registerError && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 240 }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center border-4 border-[#0a0a0b]">
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </div>
        <canvas ref={sampleRef} className="hidden" />
        <canvas ref={captureRef} className="hidden" />

        {/* Live motion meter */}
        {phase === "running" && (
          <div className="w-[200px] mt-4">
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div className="h-full rounded-full bg-blue-500"
                animate={{ width: `${Math.min(100, liveMotion * 1.4)}%` }}
                transition={{ duration: 0.15 }} />
            </div>
            <p className="text-[9px] font-light text-zinc-700 text-center mt-1.5 tracking-wide uppercase">
              {liveMotion > 8 ? "Motion detected" : "Waiting for movement…"}
            </p>
          </div>
        )}

        {/* Prompt / status */}
        <div className="h-12 mt-4 flex flex-col items-center justify-center text-center">
          {phase === "intro" && !camError && (
            <p className="text-[12px] font-light text-zinc-500">Make sure your face is well lit, then start the check.</p>
          )}
          {phase === "running" && (
            <motion.p key={promptIndex} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="text-[13px] font-normal text-blue-300">{PROMPTS[promptIndex].label}</motion.p>
          )}
          {phase === "running" && hint && (
            <p className="text-[10.5px] font-light text-amber-400/80 mt-1">{hint}</p>
          )}
          {phase === "done" && registering && (
            <p className="text-[12px] font-light text-zinc-500 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating your secure account…
            </p>
          )}
          {phase === "done" && !registering && !registerError && (
            <p className="text-[13px] font-normal text-emerald-400">Liveness confirmed</p>
          )}
          {registerError && <p className="text-[12px] font-light text-red-400">{registerError}</p>}
        </div>
      </div>

      {/* Actions */}
      {phase === "intro" && (
        camError ? (
          <button onClick={() => setRetryKey((k) => k + 1)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-lg transition-colors">
            <RotateCw className="w-4 h-4" /> Retry camera access
          </button>
        ) : (
          <button onClick={() => { setPromptIndex(0); setPhase("running"); }} disabled={!camReady}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-normal rounded-lg transition-colors">
            <ScanFace className="w-4 h-4" /> Start liveness check
          </button>
        )
      )}
      {registerError && (
        <button onClick={onRetryRegister}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-normal rounded-lg transition-colors">
          <RotateCw className="w-4 h-4" /> Try again
        </button>
      )}

      {phase === "intro" && (
        <button onClick={onBack}
          className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 text-zinc-600 hover:text-zinc-300 text-[12px] font-light transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      )}
    </motion.div>
  );
}

/* ════════ Page ════════ */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<Record<string, string>>({
    name: "", email: "", phone: "", country: "", dob: "", password: "", confirm: "",
  });
  const [agree, setAgree] = useState(false);
  const [consent, setConsent] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");

  function go(next: Step, d = 1) { setDir(d); setStep(next); }

  const finish = useCallback(async () => {
    setRegistering(true); setRegisterError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password,
          phone: form.phone, country: form.country, dob: form.dob,
          phoneVerified: true, faceVerified: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setRegisterError(data.error || "Registration failed"); setRegistering(false); return; }
      router.push("/dashboard");
    } catch {
      setRegisterError("Network error. Please try again.");
      setRegistering(false);
    }
  }, [form, router]);

  const stepIndex = STEP_LIST.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white flex">

      {/* ─── Left panel ─── */}
      <aside className="hidden lg:flex flex-col w-[42%] max-w-lg border-r border-white/[0.05] bg-[#0c0c0d] px-12 py-12">
        <Link href="/" className="flex items-center gap-2.5 mb-auto">
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-normal text-white text-[15px]">VaultX</span>
        </Link>

        <div className="my-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-400/[0.06] border border-emerald-400/15 mb-7">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-normal text-emerald-400/90 tracking-wide">Verified onboarding</span>
          </div>
          <h2 className="text-[26px] font-light leading-tight tracking-tight mb-8">
            Three quick steps to a<br />fully secured account.
          </h2>

          <div className="space-y-2">
            {STEP_LIST.map((s, i) => {
              const done = i < stepIndex, active = i === stepIndex;
              return (
                <div key={s.id} className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl border transition-colors ${
                  active ? "bg-blue-500/[0.06] border-blue-500/20" : "border-transparent"
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-normal shrink-0 ${
                    done ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                      : active ? "bg-blue-600 text-white"
                      : "bg-white/[0.04] text-zinc-600 border border-white/[0.06]"
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <div>
                    <p className={`text-[13px] ${active || done ? "text-zinc-200" : "text-zinc-500"} font-normal`}>{s.label}</p>
                    <p className="text-[11px] font-light text-zinc-600">{s.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-start gap-3 mt-9">
            <Snowflake className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[12px] font-light text-zinc-600 leading-relaxed">
              Your data is encrypted end-to-end. The liveness check runs entirely on your device — camera footage is never uploaded.
            </p>
          </div>
        </div>

        <p className="text-[11px] font-light text-zinc-700 mt-auto">
          © {new Date().getFullYear()} VaultX. Protected by TLS encryption.
        </p>
      </aside>

      {/* ─── Wizard ─── */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-md px-6 py-10">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-7">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-normal text-white text-[15px]">VaultX</span>
          </Link>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-7">
            {STEP_LIST.map((s, i) => (
              <div key={s.id} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= stepIndex ? "bg-blue-500" : "bg-white/[0.08]"
              }`} />
            ))}
          </div>
          <p className="text-[10px] font-normal tracking-[0.18em] text-zinc-600 uppercase mb-1">
            Step {stepIndex + 1} of {STEP_LIST.length}
          </p>
          {step === "details" && (
            <h1 className="text-[22px] font-light tracking-tight text-white mb-6">Create your account</h1>
          )}
          {step !== "details" && <div className="mb-5" />}

          <AnimatePresence mode="wait" custom={dir}>
            {step === "details" && (
              <DetailsStep key="details" dir={dir}
                form={form} setForm={setForm}
                agree={agree} setAgree={setAgree} consent={consent} setConsent={setConsent}
                onNext={() => go("phone", 1)} />
            )}
            {step === "phone" && (
              <PhoneStep key="phone" dir={dir} phone={form.phone}
                onBack={() => go("details", -1)}
                onVerified={() => go("face", 1)} />
            )}
            {step === "face" && (
              <FaceStep key="face" dir={dir}
                registering={registering} registerError={registerError}
                onBack={() => go("phone", -1)}
                onComplete={finish}
                onRetryRegister={finish} />
            )}
          </AnimatePresence>

          <p className="mt-7 text-center text-[12px] font-light text-zinc-600">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:text-zinc-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
