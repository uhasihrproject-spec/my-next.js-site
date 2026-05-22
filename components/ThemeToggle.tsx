"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme, type ThemeChoice } from "./ThemeProvider";

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light",  label: "Light",  Icon: Sun },
  { value: "dark",   label: "Dark",   Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, resolved, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Geometric centre of the button — used as the iris origin so the new
  // theme appears to "wash in" from the toggle.
  function originFromButton() {
    const el = btnRef.current;
    if (!el) return undefined;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function pick(value: ThemeChoice, e?: React.MouseEvent) {
    const origin = e
      ? { x: e.clientX, y: e.clientY }
      : originFromButton();
    setTheme(value, origin);
    setOpen(false);
  }

  const ActiveIcon = resolved === "light" ? Sun : Moon;

  return (
    <div ref={ref} className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle theme"
        className={`flex items-center justify-center rounded-lg border border-[var(--line-1)] hover:border-[var(--line-2)] bg-[var(--surface-1)] transition-colors ${
          compact ? "w-8 h-8" : "w-9 h-9"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={resolved}
            initial={{ y: -8, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 8, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.18 }}
            className="text-[var(--fg-2)]"
          >
            <ActiveIcon className="w-[15px] h-[15px]" />
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 mt-2 w-40 rounded-xl border border-[var(--line-1)] bg-[var(--surface-1)] shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
            <div className="p-1">
              {OPTIONS.map(({ value, label, Icon }) => {
                const active = theme === value;
                return (
                  <button
                    key={value}
                    onClick={(e) => pick(value, e)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] font-light text-left transition-colors ${
                      active
                        ? "bg-blue-500/[0.12] text-blue-400"
                        : "text-[var(--fg-3)] hover:bg-[var(--surface-2)] hover:text-[var(--fg-1)]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="flex-1">{label}</span>
                    {active && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
