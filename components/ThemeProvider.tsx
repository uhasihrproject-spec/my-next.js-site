"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
type Resolved = "light" | "dark";

interface Ctx {
  theme: ThemeChoice;
  resolved: Resolved;
  setTheme: (t: ThemeChoice) => void;
  /** "to-light" | "to-dark" while the sky overlay is animating, else null. */
  transitioning: "to-light" | "to-dark" | null;
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

/** Total transition duration must match the overlay animation in ThemeTransition.tsx */
const TRANSITION_MS = 1100;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("dark");
  const [resolved, setResolved] = useState<Resolved>("dark");
  const [transitioning, setTransitioning] = useState<"to-light" | "to-dark" | null>(null);
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

  const animateTo = useCallback((next: Resolved) => {
    if (next === resolved) return;
    // Add a global class so every element fades color smoothly while the
    // overlay plays. Stripped after the animation completes.
    document.documentElement.classList.add("theme-transitioning");
    setTransitioning(next === "light" ? "to-light" : "to-dark");
    // Switch the actual theme attribute mid-sweep so the underlying
    // surfaces fade behind the overlay.
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      apply(next);
      setResolved(next);
    }, TRANSITION_MS * 0.32);
    setTimeout(() => {
      setTransitioning(null);
      document.documentElement.classList.remove("theme-transitioning");
    }, TRANSITION_MS);
  }, [resolved]);

  const setTheme = useCallback((t: ThemeChoice) => {
    localStorage.setItem(STORAGE_KEY, t);
    const next: Resolved = t === "system" ? systemPref() : t;
    setThemeState(t);
    if (next === resolved) return;
    animateTo(next);
  }, [animateTo, resolved]);

  return (
    <ThemeCtx.Provider value={{ theme, resolved, setTheme, transitioning }}>
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
  };
}
