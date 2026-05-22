import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateUser, hashPassword, saveOtp, checkOtp } from "@/lib/db";
import { sendEmail, emailLayout } from "@/lib/notify";
import { verifyRecaptcha } from "@/lib/recaptcha";

/**
 * Password reset, email-verified.
 *   action: "request" → look up the account, email a 6-digit reset code.
 *   action: "reset"   → verify the code and set a new password.
 */
export async function POST(req: NextRequest) {
  try {
    const { action, email, code, password, recaptchaToken } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const addr = email.trim().toLowerCase();
    const user = await getUserByEmail(addr);

    if (action === "request") {
      const captcha = await verifyRecaptcha(recaptchaToken);
      if (!captcha.ok) {
        return NextResponse.json({ error: captcha.error || "reCAPTCHA failed" }, { status: 400 });
      }
      if (!user) {
        return NextResponse.json(
          { error: "No account was found for that email." },
          { status: 404 }
        );
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await saveOtp(addr, otp);

      const html = emailLayout(
        "Reset your password",
        `Use the code below to confirm your password reset on VaultX.<br><br>
         <div style="display:inline-block;background:#0c1124;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px 22px;color:#ffffff;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:26px;letter-spacing:9px;font-weight:600;">${otp}</div>
         <br><br>
         The code expires in 10 minutes. If you didn't request a reset, you can safely ignore this email — your password won't change.`
      );

      const result = await sendEmail(addr, "Your VaultX password-reset code", html);
      if (!result.ok) {
        console.error("[reset] Could not email reset code:", result.error);
        return NextResponse.json({
          success: true,
          sent: false,
          devCode: otp,
          note: result.error || "Email delivery unavailable",
        });
      }
      return NextResponse.json({ success: true, sent: true });
    }

    if (action === "reset") {
      if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });
      if (!code || !(await checkOtp(addr, String(code)))) {
        return NextResponse.json({ error: "Incorrect or expired code" }, { status: 400 });
      }
      if (!password || String(password).length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
      }
      await updateUser({ ...user, password: hashPassword(String(password)) });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
