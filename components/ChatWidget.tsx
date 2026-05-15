"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, Lock, GripVertical } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence, useDragControls } from "framer-motion";

interface Message {
  id: string;
  text: string;
  from: "user" | "admin";
  createdAt: string;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevAdminCount = useRef(0);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const btnDragStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) { setAuthed(true); setIsAdmin(d.user.role === "admin"); }
        else setAuthed(false);
      })
      .catch(() => setAuthed(false));
  }, []);

  async function loadMessages() {
    if (!authed || isAdmin) return;
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) return;
      const data = await res.json();
      const msgs: Message[] = data.messages || [];
      setMessages(msgs);
      if (!open) {
        const ac = msgs.filter((m) => m.from === "admin").length;
        if (ac > prevAdminCount.current) setUnread((u) => u + (ac - prevAdminCount.current));
        prevAdminCount.current = ac;
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages, open]);

  useEffect(() => {
    if (!open || !authed || isAdmin) return;
    loadMessages();
    const id = setInterval(loadMessages, 8000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, authed, isAdmin]);

  function openChat() {
    setOpen(true);
    setUnread(0);
    prevAdminCount.current = messages.filter((m) => m.from === "admin").length;
    if (authed && !isAdmin) loadMessages();
  }

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((p) => [...p, data.message]);
        setText("");
      }
    } catch { /* ignore */ }
    finally { setSending(false); }
  }

  if (isAdmin) return null;

  return (
    <>
      {/* Full-screen drag constraints layer */}
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-40" />

      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraintsRef}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 select-none"
      >
        {/* Chat panel */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-[340px] sm:w-[360px] flex flex-col bg-[#1a1a1e] border border-white/[0.09] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden"
              style={{ maxHeight: "480px" }}
            >
              {/* Header — drag handle */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.07] bg-[#141418] shrink-0 cursor-grab active:cursor-grabbing touch-none"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_14px_rgba(59,130,246,0.4)]">
                    <MessageCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">Support Chat</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-[10px] text-zinc-600">VaultX · usually fast</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <GripVertical className="w-4 h-4 text-zinc-700" />
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setOpen(false)}
                    className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              {authed === null ? (
                <div className="flex-1 flex items-center justify-center py-14">
                  <Loader2 className="w-5 h-5 text-zinc-700 animate-spin" />
                </div>
              ) : !authed ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#1a1a22] border border-white/[0.07] flex items-center justify-center mb-4">
                    <Lock className="w-5 h-5 text-zinc-600" />
                  </div>
                  <p className="text-[14px] font-semibold text-white mb-1.5">Sign in to chat</p>
                  <p className="text-[12px] text-zinc-600 mb-6 leading-relaxed max-w-[200px]">
                    Create a free account to talk directly with our support team.
                  </p>
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-semibold rounded-xl transition-colors">
                    Sign in
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}
                    className="mt-2.5 text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
                    New here? Create account →
                  </Link>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                    {messages.length === 0 && (
                      <div className="text-center pt-6">
                        <p className="text-[12px] text-zinc-700 leading-relaxed">
                          👋 Hi! Send us a message and we&apos;ll reply as soon as possible.
                        </p>
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                          msg.from === "user"
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-[#222228] border border-white/[0.06] text-zinc-300 rounded-bl-sm"
                        }`}>
                          {msg.from === "admin" && (
                            <p className="text-[10px] font-bold text-blue-400 mb-0.5">VaultX Support</p>
                          )}
                          <p>{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${msg.from === "user" ? "text-blue-300/50" : "text-zinc-700"}`}>
                            {fmtTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-white/[0.07] bg-[#141418] shrink-0">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                        placeholder="Type a message…"
                        rows={1}
                        className="flex-1 resize-none bg-[#1e1e24] border border-white/[0.07] rounded-xl px-3.5 py-2.5 text-[12px] text-white placeholder-zinc-700 focus:outline-none focus:border-white/[0.15] transition-colors leading-relaxed"
                        style={{ maxHeight: "80px" }}
                      />
                      <button
                        onClick={send}
                        disabled={!text.trim() || sending}
                        className="shrink-0 w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        {sending
                          ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                          : <Send className="w-3.5 h-3.5 text-white" />
                        }
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-800 mt-1.5">Enter to send · Shift+Enter new line</p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating button — draggable (drag to move, tap to open) */}
        <motion.button
          onPointerDown={(e) => {
            btnDragStart.current = { x: e.clientX, y: e.clientY };
            dragControls.start(e);
          }}
          onClick={(e) => {
            const s = btnDragStart.current;
            if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 6) return; // was a drag
            if (open) setOpen(false);
            else openChat();
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-[0_0_0_1px_rgba(59,130,246,0.3),0_8px_32px_rgba(59,130,246,0.35)] transition-colors cursor-grab active:cursor-grabbing touch-none"
        >
          <AnimatePresence mode="wait">
            {open
              ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-5 h-5 text-white" />
                </motion.span>
              : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <MessageCircle className="w-5 h-5 text-white" />
                </motion.span>
            }
          </AnimatePresence>
          {!open && unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-[9px] text-white font-semibold flex items-center justify-center shadow-lg"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </motion.button>
      </motion.div>
    </>
  );
}
