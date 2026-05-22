"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
type Resolved = "light" | "dark";

export type Origin = { x: number; y: number };

interface Ctx {
  theme: ThemeChoice;
  resolved: Resolved;
  setTheme: (t: ThemeChoice, origin?: Origin) => void;
  /** "to-light" | "to-dark" while the iris is animating, else null. */
  transitioning: "to-light" | "to-dark" | null;
  /** Click origin in viewport pixels — where the iris should expand from. */
  origin: Origin | null;
}

const ThemeCtx = createContext<Ctx | null>(null);
const STORAGE_KEY = "vaultx_theme";

function systemPref(): Resolved {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function apply(resolved: Resolved) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
}

/** Total runtime of the iris reveal — long enough for the spinning logo
 *  to read clearly. */
const TRANSITION_MS = 1500;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("dark");
  const [resolved, setResolved] = useState<Resolved>("dark");
  const [transitioning, setTransitioning] = useState<"to-light" | "to-dark" | null>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // hydrate from storage on mount
  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as ThemeChoice) || "system";
    const r: Resolved = saved === "system" ? systemPref() : saved;
    setThemeState(saved);
    setResolved(r);
    apply(r);
  }, []);

  // listen for system changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const r: Resolved = mq.matches ? "light" : "dark";
      animateTo(r);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const animateTo = useCallback((next: Resolved, ox?: number, oy?: number) => {
    if (next === resolved) return;
    // Default origin: top-right corner where the navbar toggle lives
    const x = typeof ox === "number" ? ox : (typeof window !== "undefined" ? window.innerWidth - 60 : 0);
    const y = typeof oy === "number" ? oy : 40;
    setOrigin({ x, y });

    setTransitioning(next === "light" ? "to-light" : "to-dark");

    // Flip the theme immediately on the next frame so the page underneath
    // the iris is already the destination theme. The disc just hides the
    // moment of swap visually.
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      apply(next);
      setResolved(next);
    }, 16);

    setTimeout(() => {
      setTransitioning(null);
      setOrigin(null);
    }, TRANSITION_MS);
  }, [resolved]);

  const setTheme = useCallback((t: ThemeChoice, o?: Origin) => {
    localStorage.setItem(STORAGE_KEY, t);
    const next: Resolved = t === "system" ? systemPref() : t;
    setThemeState(t);
    if (next === resolved) return;
    animateTo(next, o?.x, o?.y);
  }, [animateTo, resolved]);

  return (
    <ThemeCtx.Provider value={{ theme, resolved, setTheme, transitioning, origin }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const v = useContext(ThemeCtx);
  return v ?? {
    theme: "dark" as ThemeChoice,
    resolved: "dark" as Resolved,
    setTheme: () => {},
    transitioning: null as Ctx["transitioning"],
    origin: null as Origin | null,
  };
}
