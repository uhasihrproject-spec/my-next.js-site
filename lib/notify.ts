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
 * Branded VaultX email shell — clean, modern dark transactional layout
 * using Space Grotesk display font with a bold editorial feel.
 *
 * Table-based layout for maximum email client compatibility.
 * Space Grotesk loads via @import for Apple Mail / iOS / webmail;
 * all others fall back gracefully to the system font stack.
 */
export function emailLayout(
  heading: string,
  body: string,
  cta?: { label: string; url: string }
): string {
  const year = `2015 - ${new Date().getFullYear()}`;
  const FONT = "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

  const ctaBlock = cta
    ? `
      <tr>
        <td style="padding:0 40px 36px;">
          <a href="${cta.url}"
             style="display:inline-block;background-color:#2563eb;color:#ffffff;font-family:${FONT};font-size:13px;font-weight:500;text-decoration:none;padding:13px 26px;border-radius:10px;letter-spacing:0.1px;">
            ${cta.label} &rarr;
          </a>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark only">
  <meta name="supported-color-schemes" content="dark only">
  <title>VaultX</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&display=swap');
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
    table,td{mso-table-lspace:0;mso-table-rspace:0;border-collapse:collapse;}
    img{border:0;outline:none;line-height:100%;}
    a{text-decoration:none;}
    body{margin:0!important;padding:0!important;width:100%!important;background:#08080c;}
    @media(max-width:600px){
      .vx-pad{padding-left:24px!important;padding-right:24px!important;}
      .vx-h1{font-size:28px!important;letter-spacing:-1px!important;}
      .vx-metrics td{display:block!important;width:100%!important;border-right:none!important;border-bottom:1px solid rgba(255,255,255,0.05)!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#08080c;font-family:${FONT};">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#08080c;">
    <tr>
      <td align="center" style="padding:56px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"
               style="width:100%;max-width:500px;">

          <!-- Logo -->
          <tr>
            <td style="padding:0 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <!-- Canonical 4-square VaultX mark, inline SVG so it travels through email -->
                    <div style="width:30px;height:30px;background-color:#2563eb;border-radius:8px;line-height:0;text-align:center;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 12 12" style="display:inline-block;vertical-align:middle;margin-top:7px;">
                        <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="0.7" fill="#ffffff"/>
                        <rect x="7"   y="0.5" width="4.5" height="4.5" rx="0.7" fill="#ffffff" fill-opacity="0.55"/>
                        <rect x="0.5" y="7"   width="4.5" height="4.5" rx="0.7" fill="#ffffff" fill-opacity="0.55"/>
                        <rect x="7"   y="7"   width="4.5" height="4.5" rx="0.7" fill="#ffffff" fill-opacity="0.30"/>
                      </svg>
                    </div>
                  </td>
                  <td style="padding-left:9px;vertical-align:middle;">
                    <span style="color:#ffffff;font-family:${FONT};font-size:15px;font-weight:500;letter-spacing:-0.1px;">VaultX</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#0f0f13;border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Hero -->
                <tr>
                  <td class="vx-pad"
                      style="padding:44px 40px 32px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <div style="display:inline-block;background-color:rgba(37,99,235,0.12);color:#60a5fa;font-family:${FONT};font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;padding:5px 10px;border-radius:6px;margin-bottom:20px;">
                      VaultX notification
                    </div>
                    <h1 class="vx-h1"
                        style="margin:0 0 16px;color:#ffffff;font-family:${FONT};font-size:36px;font-weight:300;letter-spacing:-1.5px;line-height:1.1;">
                      ${heading}
                    </h1>
                    <p style="margin:0;color:#71717a;font-family:${FONT};font-size:14px;font-weight:300;line-height:1.75;">
                      ${body}
                    </p>
                  </td>
                </tr>

                ${ctaBlock}

                <!-- Security note -->
                <tr>
                  <td class="vx-pad" style="padding:24px 40px 28px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:top;width:8px;padding-top:5px;">
                          <div style="width:6px;height:6px;border-radius:50%;background-color:#27272a;"></div>
                        </td>
                        <td style="padding-left:10px;color:#3f3f46;font-family:${FONT};font-size:11.5px;font-weight:300;line-height:1.65;">
                          Automated notification — please don't reply.<br>
                          VaultX will never ask for your password or PIN.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0 0;text-align:center;">
              <p style="margin:0;color:#27272a;font-family:${FONT};font-size:11px;font-weight:300;letter-spacing:0.03em;line-height:1.8;">
                &copy; ${year} VaultX &middot; Cold storage &middot; Bank-grade encryption<br>
                You're receiving this because you have a VaultX account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}