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

/**
 * Admin diagnostics — send a real test email or SMS and return the exact
 * provider result so misconfiguration (missing key, unverified domain, etc.)
 * is visible immediately.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  try {
    const { type, to } = await req.json();

    if (type === "email") {
      if (!to) return NextResponse.json({ ok: false, error: "Enter a test email address" });
      const result = await sendEmail(
        String(to),
        "VaultX — test email",
        emailLayout("Test email", "If you're reading this, your Resend email notifications are working correctly.")
      );
      return NextResponse.json(
        result.ok
          ? { ok: true, message: `Test email sent to ${to}.` }
          : { ok: false, error: result.error || "Email failed" }
      );
    }

    if (type === "sms") {
      if (!to) return NextResponse.json({ ok: false, error: "Enter a test phone number" });
      const key = process.env.TEXTBELT_KEY || "textbelt";
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
        const d = await r.json().catch(() => ({} as Record<string, unknown>));
        const ok = !!(d as { success?: boolean }).success;
        return NextResponse.json(
          ok
            ? { ok: true, message: `Test SMS sent to ${e164} · credits left: ${(d as { quotaRemaining?: number }).quotaRemaining ?? "?"}` }
            : { ok: false, error: String((d as { error?: string }).error || "SMS failed") }
        );
      } catch (e) {
        return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "network error" });
      }
    }

    return NextResponse.json({ ok: false, error: "Unknown test type" });
  } catch {
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
