"use client";

import { useState } from "react";
import { Mail, MessageSquare, Clock, Send, Loader2, CheckCircle2, ArrowRight } from "lucide-react";

const CHANNELS = [
  { Icon: Mail, label: "Email us", value: "support@vaultx.com", note: "Replies within a few hours" },
  { Icon: MessageSquare, label: "Live chat", value: "Available in-app", note: "Fastest way to reach us" },
  { Icon: Clock, label: "Support hours", value: "24 / 7", note: "Every day, all year round" },
];

const SUBJECTS = ["General question", "Deposits & withdrawals", "Account & security", "Partnerships", "Something else"];

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in your name, email and message.");
      return;
    }
    setSending(true);
    // No mail backend wired up — simulate delivery, then show confirmation.
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  }

  return (
    <section className="max-w-5xl mx-auto px-5 pb-24">
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
        {/* Channels */}
        <div className="space-y-3">
          {CHANNELS.map(({ Icon, label, value, note }) => (
            <div key={label} className="bg-[#1d1d20] border border-white/[0.06] rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mb-3">
                <Icon className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <p className="text-[12px] font-semibold tracking-wide text-zinc-500 uppercase mb-1">{label}</p>
              <p className="text-[15px] font-semibold text-white">{value}</p>
              <p className="text-[12px] text-zinc-600 mt-0.5">{note}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-[#1d1d20] border border-white/[0.06] rounded-2xl p-6 md:p-8">
          {sent ? (
            <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Message sent</h3>
              <p className="text-sm text-zinc-500 max-w-sm leading-relaxed mb-6">
                Thanks for reaching out, {form.name.split(" ")[0] || "there"}. Our team will get back to you at{" "}
                <span className="text-zinc-300">{form.email}</span> shortly.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" }); }}
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Send another message <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-1">Send us a message</h3>
              <p className="text-[13px] text-zinc-500 mb-5">We typically respond within a few hours.</p>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[13px]">
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-600 mb-1.5">Full name</label>
                  <input
                    type="text" value={form.name} onChange={set("name")} placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 bg-[#0c0c0c] border border-white/8 rounded-lg text-white text-sm placeholder-zinc-700 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 mb-1.5">Email</label>
                  <input
                    type="email" value={form.email} onChange={set("email")} placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#0c0c0c] border border-white/8 rounded-lg text-white text-sm placeholder-zinc-700 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1.5">Topic</label>
                <select
                  value={form.subject} onChange={set("subject")}
                  className="w-full px-3.5 py-2.5 bg-[#0c0c0c] border border-white/8 rounded-lg text-white text-sm focus:outline-none focus:border-white/20 transition-colors cursor-pointer"
                >
                  {SUBJECTS.map((s) => <option key={s} value={s} className="bg-[#0c0c0c]">{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-zinc-600 mb-1.5">Message</label>
                <textarea
                  value={form.message} onChange={set("message")} rows={5} placeholder="How can we help?"
                  className="w-full px-3.5 py-2.5 bg-[#0c0c0c] border border-white/8 rounded-lg text-white text-sm placeholder-zinc-700 focus:outline-none focus:border-white/20 transition-colors resize-none"
                />
              </div>

              <button
                type="submit" disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
