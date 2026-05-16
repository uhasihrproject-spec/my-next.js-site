import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken, getUserById } from "@/lib/db";
import { sendEmail, emailLayout } from "@/lib/notify";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("vaultx_session")?.value;
  if (!token) return null;
  const session = await getSessionByToken(token);
  if (!session) return null;
  const user = await getUserById(session.userId);
  if (!user || user.role !== "admin") return null;
  return user;
}

/** TextBelt quota lookup for a given key. */
async function textbeltQuota(key: string): Promise<number | null> {
  try {
    const r = await fetch(`https://textbelt.com/quota/${encodeURIComponent(key)}`);
    const d = (await r.json().catch(() => ({}))) as { quotaRemaining?: number };
    return typeof d.quotaRemaining === "number" ? d.quotaRemaining : null;
  } catch {
    return null;
  }
}

/**
 * Admin diagnostics — send a real test email or SMS and report the exact
 * provider result, including which key is in use and its remaining quota.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    const { type, to } = await req.json();

    /* ── Email ── */
    if (type === "email") {
      if (!to) return NextResponse.json({ ok: false, error: "Enter a test email address" });
      const result = await sendEmail(
        String(to),
        "VaultX — test email",
        emailLayout("Test email", "If you're reading this, your Resend email notifications are working correctly.")
      );
      return NextResponse.json(
        result.ok
          ? { ok: true, message: `✅ Test email sent to ${to}.` }
          : { ok: false, error: result.error || "Email failed" }
      );
    }

    /* ── SMS ── */
    if (type === "sms") {
      if (!to) return NextResponse.json({ ok: false, error: "Enter a test phone number" });

      const envKey = process.env.TEXTBELT_KEY;
      const key = envKey || "textbelt";
      const keyHint = key.length > 10 ? `${key.slice(0, 4)}…${key.slice(-4)}` : key;
      const quota = await textbeltQuota(key);

      // If the env var never reached the function it falls back to the free
      // shared key (1 SMS/day) — that is almost always the "out of quota" cause.
      if (!envKey) {
        return NextResponse.json({
          ok: false,
          error:
            `⚠ TEXTBELT_KEY was NOT found by the server, so it's using the FREE shared "textbelt" key ` +
            `(1 SMS/day — quota left: ${quota ?? "?"}). Fix: in Netlify → Site settings → Environment variables, ` +
            `add TEXTBELT_KEY with your paid key, make sure its scope includes "Functions"/"Runtime", then redeploy.`,
        });
      }

      const raw = String(to).trim();
      const digits = raw.replace(/\D/g, "");
      const e164 = raw.startsWith("+") ? raw : "+" + digits;
      try {
        const r = await fetch("https://textbelt.com/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: e164,
            message: "VaultX test message — your SMS notifications are working.",
            key,
          }),
        });
        const d = (await r.json().catch(() => ({}))) as {
          success?: boolean; error?: string; quotaRemaining?: number;
        };
        const left = d.quotaRemaining ?? quota;
        if (d.success) {
          return NextResponse.json({
            ok: true,
            message: `✅ Test SMS sent to ${e164} · using your key (${keyHint}) · credits left: ${left ?? "?"}.`,
          });
        }
        const isQuota = (left === 0) || /quota/i.test(String(d.error || ""));
        return NextResponse.json({
          ok: false,
          error:
            `TextBelt rejected it: "${d.error || "unknown error"}" · using your key (${keyHint}) · ` +
            `credits on this key: ${left ?? "?"}.` +
            (isQuota
              ? ` This key shows 0 credits — your payment likely credited a DIFFERENT key. ` +
                `Sign in at textbelt.com, copy the key that actually holds your credits, and set that as TEXTBELT_KEY.`
              : ""),
        });
      } catch (e) {
        return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "network error" });
      }
    }

    return NextResponse.json({ ok: false, error: "Unknown test type" });
  } catch {
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
