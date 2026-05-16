import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken, getUserById } from "@/lib/db";
import { sendEmail, emailLayout, cleanEnv } from "@/lib/notify";

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

      const rawEnv = process.env.TEXTBELT_KEY || "";
      const envKey = cleanEnv(rawEnv);
      // Did the raw env value carry stray quotes / whitespace? That alone
      // makes TextBelt see an unknown key and report "Out of quota".
      const wasMessy = !!rawEnv.trim() && rawEnv.trim() !== envKey;
      const key = envKey || "textbelt";
      const keyHint = key.length > 10 ? `${key.slice(0, 4)}…${key.slice(-4)}` : key;
      const quota = await textbeltQuota(key);
      const fixHint = wasMessy
        ? " NOTE: your TEXTBELT_KEY value contained quotes or spaces — we stripped them here, " +
          "but please remove them in Netlify (paste the raw key only, no quotes) and redeploy."
        : "";

      if (!envKey) {
        return NextResponse.json({
          ok: false,
          error:
            `⚠ TEXTBELT_KEY was NOT found by the server, so it's using the FREE shared "textbelt" key ` +
            `(1 SMS/day — quota left: ${quota ?? "?"}). Fix: in Netlify → Site settings → Environment variables, ` +
            `add TEXTBELT_KEY with your paid key (no quotes), scope "Functions"/"Runtime", then redeploy.`,
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
            message: `✅ Test SMS sent to ${e164} · using your key (${keyHint}) · credits left: ${left ?? "?"}.${fixHint}`,
          });
        }
        const isQuota = (left === 0) || /quota/i.test(String(d.error || ""));
        return NextResponse.json({
          ok: false,
          error:
            `TextBelt rejected it: "${d.error || "unknown error"}" · key in use (${keyHint}) · ` +
            `credits on this key: ${left ?? "?"}.` +
            (wasMessy
              ? fixHint
              : isQuota
                ? ` This key shows 0 credits — TextBelt reports "Out of quota" both when a key is empty AND when ` +
                  `the key is wrong/mistyped. Re-copy the exact key from textbelt.com (it must be the one your ` +
                  `payment credited) and set it as TEXTBELT_KEY with no quotes, then redeploy.`
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
