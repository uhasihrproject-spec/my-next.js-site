/**
 * Email notifications via Resend (https://resend.com).
 *
 * Resend is free to start — 3,000 emails / month, 100 / day — and the API is a
 * single REST call, so no SDK or extra dependency is needed.
 *
 * To switch it on, add these environment variables (in Netlify → Site settings
 * → Environment variables):
 *
 *   RESEND_API_KEY   your Resend API key (begins with "re_")
 *   RESEND_FROM      sender address, e.g. "VaultX <noreply@yourdomain.com>"
 *                    (optional — defaults to Resend's shared test sender)
 *
 * Until RESEND_API_KEY is set, every call below is a silent no-op, so the app
 * works exactly the same with or without it.
 */

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[notify] RESEND_API_KEY is not set — email skipped.");
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }
  if (!to) return { ok: false, error: "No recipient address" };

  const from = process.env.RESEND_FROM || "VaultX <onboarding@resend.dev>";
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    if (!res.ok) {
      const msg = String(
        (data as { message?: string; name?: string }).message ||
        (data as { name?: string }).name ||
        `HTTP ${res.status}`
      );
      console.error("[notify] Resend rejected the email:", msg);
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "network error";
    console.error("[notify] Resend request failed:", msg);
    return { ok: false, error: msg };
  }
}

/** Wrap body copy in a simple branded VaultX email shell. */
export function emailLayout(heading: string, body: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#0a0a0b;padding:32px">
    <div style="max-width:480px;margin:0 auto;background:#111113;border:1px solid #ffffff14;border-radius:16px;overflow:hidden">
      <div style="padding:18px 24px;border-bottom:1px solid #ffffff10">
        <span style="color:#ffffff;font-size:15px;font-weight:600">VaultX</span>
      </div>
      <div style="padding:24px">
        <h2 style="color:#ffffff;font-size:18px;font-weight:600;margin:0 0 12px">${heading}</h2>
        <p style="color:#a1a1aa;font-size:14px;line-height:1.65;margin:0">${body}</p>
      </div>
      <div style="padding:16px 24px;border-top:1px solid #ffffff10">
        <span style="color:#52525b;font-size:11px">VaultX · automated notification — please do not reply</span>
      </div>
    </div>
  </div>`;
}
