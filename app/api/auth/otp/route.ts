import { NextRequest, NextResponse } from "next/server";
import { saveOtp, checkOtp } from "@/lib/db";
import { cleanEnv } from "@/lib/notify";

/**
 * Phone OTP endpoint — real SMS via TextBelt (https://textbelt.com).
 *
 * Set the TEXTBELT_KEY environment variable to your purchased TextBelt key —
 * paste the raw key only, NOT wrapped in quotes. TextBelt delivers worldwide;
 * international numbers must include the country code. If the SMS can't be
 * sent, the route returns the code in `devCode` so signup never gets stuck.
 */
export async function POST(req: NextRequest) {
  try {
    const { action, phone, code } = await req.json();

    // Read & sanitise the key per request (strips stray quotes / whitespace).
    const envKey = cleanEnv(process.env.TEXTBELT_KEY);
    const TEXTBELT_KEY = envKey || "textbelt";

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "A phone number is required" }, { status: 400 });
    }

    if (action === "send") {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 7) {
        return NextResponse.json(
          { error: "Enter a valid phone number, including the country code" },
          { status: 400 }
        );
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await saveOtp(phone, otp);

      // TextBelt needs an international number — ensure a leading "+".
      const e164 = phone.trim().startsWith("+") ? phone.trim() : "+" + digits;

      let smsSent = false;
      let smsNote = "";
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 9000);
      try {
        const r = await fetch("https://textbelt.com/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: e164,
            message: `Your VaultX verification code is ${otp}. It expires in 10 minutes.`,
            key: TEXTBELT_KEY,
          }),
          signal: ctrl.signal,
        });
        const d = await r.json().catch(() => ({} as Record<string, unknown>));
        smsSent = !!(d as { success?: boolean }).success;
        if (smsSent) {
          console.log("[otp] TextBelt sent OK · quotaRemaining:", (d as { quotaRemaining?: number }).quotaRemaining);
        } else {
          smsNote = String((d as { error?: string }).error || "SMS provider unavailable");
          console.error("[otp] TextBelt did not send:", smsNote,
            "· quotaRemaining:", (d as { quotaRemaining?: number }).quotaRemaining,
            "· keySource:", envKey
              ? "env TEXTBELT_KEY"
              : "DEFAULT free 'textbelt' key — TEXTBELT_KEY env var not found!");
        }
      } catch (e) {
        smsNote = e instanceof Error ? e.message : "network error";
        console.error("[otp] TextBelt request failed:", smsNote);
      } finally {
        clearTimeout(timer);
      }

      return smsSent
        ? NextResponse.json({ success: true, sms: true })
        : NextResponse.json({ success: true, sms: false, devCode: otp, smsNote });
    }

    if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });
      }
      if (!(await checkOtp(phone, String(code)))) {
        return NextResponse.json({ error: "Incorrect or expired code" }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
