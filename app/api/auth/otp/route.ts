import { NextRequest, NextResponse } from "next/server";
import { saveOtp, checkOtp } from "@/lib/db";

/**
 * Phone OTP endpoint.
 *
 * No SMS provider is configured, so `action: "send"` returns the generated
 * code in `devCode` and the signup UI surfaces it — the flow works end-to-end
 * for free. To deliver real SMS, send `otp` via a provider (e.g. Twilio) where
 * indicated below and stop returning `devCode`.
 */
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
      saveOtp(phone, otp);

      // ── Plug a real SMS provider here to deliver `otp` to `phone` ──
      // e.g. await twilioClient.messages.create({ to: phone, body: `VaultX code: ${otp}` })

      return NextResponse.json({ success: true, devCode: otp });
    }

    if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });
      }
      if (!checkOtp(phone, String(code))) {
        return NextResponse.json({ error: "Incorrect or expired code" }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
