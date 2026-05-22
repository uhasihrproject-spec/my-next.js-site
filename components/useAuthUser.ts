"use client";

import { useEffect, useState } from "react";

export interface AuthUser {
  name: string;
  email?: string;
  role: string;
}

/**
 * Shared auth-state hook for the marketing pages.
 *
 * Fetches /api/auth/me once on mount and caches the result in-memory for
 * the lifetime of the tab — so a Footer, CTA banner, Pricing tier, and
 * SupportedCoins call site all share a single request and a consistent
 * answer rather than each pinging the API independently.
 *
 *   const { user, loaded } = useAuthUser();
 *   if (loaded && user) { … hide signup CTAs … }
 */
let cached: AuthUser | null | undefined; // undefined = unfetched, null = anon
let inflight: Promise<AuthUser | null> | null = null;
const listeners = new Set<(u: AuthUser | null) => void>();

function notify(u: AuthUser | null) {
  cached = u;
  listeners.forEach((fn) => fn(u));
}

async function fetchOnce(): Promise<AuthUser | null> {
  if (cached !== undefined) return cached;
  if (inflight) return inflight;
  inflight = fetch("/api/auth/me")
    .then((r) => r.json())
    .then((d) => {
      const u: AuthUser | null = d?.user ?? null;
      notify(u);
      return u;
    })
    .catch(() => {
      notify(null);
      return null;
    })
    .finally(() => { inflight = null; });
  return inflight;
}

/** Force-refresh after login/logout. */
export function refreshAuthUser() {
  cached = undefined;
  return fetchOnce();
}

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(cached ?? null);
  const [loaded, setLoaded] = useState<boolean>(cached !== undefined);

  useEffect(() => {
    const listener = (u: AuthUser | null) => {
      setUser(u);
      setLoaded(true);
    };
    listeners.add(listener);
    if (cached === undefined) {
      fetchOnce().then((u) => listener(u));
    } else {
      listener(cached);
    }
    return () => { listeners.delete(listener); };
  }, []);

  return { user, loaded };
}
