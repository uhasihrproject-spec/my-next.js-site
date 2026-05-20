import { NextRequest, NextResponse } from "next/server";
import { saveOtp, checkOtp } from "@/lib/db";
import { sendEmail, emailLayout } from "@/lib/notify";

/**
 * Email-based verification code endpoint.
 *
 * `action: "send"`   → generate a 6-digit code and email it via Resend.
 * `action: "verify"` → validate the code for that email.
 *
 * If Resend isn't configured / a delivery error occurs, the code is returned
 * as `devCode` so signup never gets stuck.
 */
export async function POST(req: NextRequest) {
  try {
    const { action, email, code } = await req.json();

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    const addr = email.trim().toLowerCase();

    if (action === "send") {
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await saveOtp(addr, otp);

      const html = emailLayout(
        "Verify your email",
        `Use the code below to confirm your VaultX account.<br><br>
         <div style="display:inline-block;background:#0c1124;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px 22px;color:#ffffff;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:26px;letter-spacing:9px;font-weight:600;">${otp}</div>
         <br><br>
         The code expires in 10 minutes. If you didn't request this, you can safely ignore the email.`
      );

      const result = await sendEmail(addr, "Your VaultX verification code", html);
      if (!result.ok) {
        console.error("[otp] Could not email verification code:", result.error);
        return NextResponse.json({
          success: true,
          sent: false,
          devCode: otp,
          note: result.error || "Email delivery unavailable",
        });
      }
      return NextResponse.json({ success: true, sent: true });
    }

    if (action === "verify") {
      if (!code) {
        return NextResponse.json({ error: "Enter the 6-digit code" }, { status: 400 });
      }
      if (!(await checkOtp(addr, String(code)))) {
        return NextResponse.json({ error: "Incorrect or expired code" }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
