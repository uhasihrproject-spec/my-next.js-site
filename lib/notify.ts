/**
 * Email notifications via Resend (https://resend.com).
 *
 * Environment variables (Netlify → Site settings → Environment variables):
 *   RESEND_API_KEY   your Resend API key (begins with "re_")
 *   RESEND_FROM      sender, e.g. "VaultX <noreply@yourdomain.com>" (optional)
 *
 * IMPORTANT: paste the raw value only — do NOT wrap it in quotes. This module
 * strips stray quotes/whitespace defensively, but a clean value is best.
 */

/** Strip surrounding quotes and whitespace that often sneak into env values. */
export function cleanEnv(v: string | undefined | null): string {
  return (v || "").trim().replace(/^['"`]+|['"`]+$/g, "").trim();
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  const key = cleanEnv(process.env.RESEND_API_KEY);
  if (!key) {
    console.warn("[notify] RESEND_API_KEY is not set — email skipped.");
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }
  if (!to) return { ok: false, error: "No recipient address" };

  const from = cleanEnv(process.env.RESEND_FROM) || "VaultX <onboarding@resend.dev>";
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

/**
 * Branded VaultX email shell — a polished dark transactional layout.
 * `body` may contain inline HTML. `cta` optionally renders a button.
 */
export function emailLayout(
  heading: string,
  body: string,
  cta?: { label: string; url: string }
): string {
  const year = new Date().getFullYear();
  const ctaBlock = cta
    ? `<tr><td style="padding:6px 36px 30px;">
         <a href="${cta.url}" style="display:inline-block;background-color:#2563eb;background-image:linear-gradient(180deg,#3b82f6,#2563eb);color:#ffffff;font-size:13.5px;font-weight:600;text-decoration:none;padding:12px 26px;border-radius:10px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">${cta.label}</a>
       </td></tr>`
    : "";

  return `<div style="background-color:#070709;margin:0;padding:0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#070709;">
    <tr><td align="center" style="padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;">

        <!-- Brand -->
        <tr><td style="padding:0 6px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td>
              <div style="width:30px;height:30px;background-color:#3b82f6;border-radius:8px;color:#ffffff;font-size:16px;font-weight:700;text-align:center;line-height:30px;font-family:Arial,Helvetica,sans-serif;">V</div>
            </td>
            <td style="padding-left:10px;color:#ffffff;font-size:16px;font-weight:600;letter-spacing:-0.2px;">VaultX</td>
          </tr></table>
        </td></tr>

        <!-- Card -->
        <tr><td style="background-color:#101014;border:1px solid rgba(255,255,255,0.08);border-radius:18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:4px;background-color:#3b82f6;background-image:linear-gradient(90deg,#3b82f6,#6366f1,#3b82f6);font-size:0;line-height:0;border-radius:18px 18px 0 0;">&nbsp;</td></tr>
            <tr><td style="padding:34px 36px 22px;">
              <h1 style="margin:0 0 14px;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.3px;">${heading}</h1>
              <div style="color:#9ca3af;font-size:14.5px;line-height:1.7;">${body}</div>
            </td></tr>
            ${ctaBlock}
            <tr><td style="padding:0 36px;"><div style="height:1px;background-color:rgba(255,255,255,0.07);"></div></td></tr>
            <tr><td style="padding:18px 36px 26px;">
              <p style="margin:0;color:#52525b;font-size:11.5px;line-height:1.6;">
                🔒 This is an automated VaultX security notification — please don't reply.
                VaultX will never ask for your password or PIN.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:22px 8px 0;">
          <p style="margin:0;color:#3f3f46;font-size:11px;line-height:1.7;">
            © ${year} VaultX · You're receiving this because you have a VaultX account.<br>
            Funds are held in cold storage and protected with bank-grade encryption.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</div>`;
}
