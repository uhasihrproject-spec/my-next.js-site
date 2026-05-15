import { NextRequest, NextResponse } from "next/server";
import { saveOtp, checkOtp } from "@/lib/db";

/**
 * Phone OTP endpoint.
 *
 * Real SMS delivery via TextBelt (https://textbelt.com) — free, no signup.
 * The free key "textbelt" sends 1 real SMS per day per IP. Set a TEXTBELT_KEY
 * env var (a paid pay-as-you-go key) to lift that limit.
 *
 * If the SMS can't be sent (quota reached / network error) the route falls
 * back to "demo mode" and returns the code in `devCode` so signup still works.
 */
const TEXTBELT_KEY = process.env.TEXTBELT_KEY || "textbelt";

export async function POST(req: NextRequest) {
  try {
    const { action, phone, code } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "A phone number is required" }, { status: 400 });
    }

    if (action === "send") {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 7) {
        return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await saveOtp(phone, otp);

      // Attempt a real SMS via TextBelt.
      let smsSent = false;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      try {
        const r = await fetch("https://textbelt.com/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            message: `Your VaultX verification code is ${otp}. It expires in 10 minutes.`,
            key: TEXTBELT_KEY,
          }),
          signal: ctrl.signal,
        });
        const d = await r.json();
        smsSent = !!d.success;
      } catch {
        /* network error or timeout — fall back to demo mode */
      } finally {
        clearTimeout(timer);
      }

      // If the text went out, never expose the code. Otherwise return it so
      // the flow still works without an SMS gateway.
      return smsSent
        ? NextResponse.json({ success: true, sms: true })
        : NextResponse.json({ success: true, sms: false, devCode: otp });
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
