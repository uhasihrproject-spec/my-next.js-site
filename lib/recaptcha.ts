/**
 * Google reCAPTCHA v2 ("I'm not a robot" checkbox) verifier.
 *
 * Env (set in Netlify → Site settings → Environment variables):
 *   NEXT_PUBLIC_RECAPTCHA_SITE_KEY   public site key (used by the widget)
 *   RECAPTCHA_SECRET_KEY             server secret (used here)
 *
 * If neither key is set, verification is skipped — handy in local dev
 * before you've registered the domain with Google. Once `RECAPTCHA_SECRET_KEY`
 * is set in production, the check becomes mandatory.
 */

import { cleanEnv } from "./notify";

export interface RecaptchaResult {
  ok: boolean;
  error?: string;
  /** True when verification was skipped (no secret configured). */
  skipped?: boolean;
}

export async function verifyRecaptcha(token: string | undefined | null): Promise<RecaptchaResult> {
  const secret = cleanEnv(process.env.RECAPTCHA_SECRET_KEY);
  if (!secret) {
    // No secret configured — let the request through but flag it.
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, error: "Please tick the “I’m not a robot” box." };
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }).toString(),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      const codes = (data["error-codes"] || []).join(", ") || "verification failed";
      return { ok: false, error: `reCAPTCHA: ${codes}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}
