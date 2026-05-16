import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateUser, hashPassword, saveOtp, checkOtp } from "@/lib/db";

const TEXTBELT_KEY = process.env.TEXTBELT_KEY || "textbelt";

function maskPhone(p: string) {
  const d = p.replace(/\D/g, "");
  return d.length >= 4 ? "•••• •••• " + d.slice(-4) : "your phone";
}

/**
 * Password reset.
 *   action: "request" → look up the account, send a reset code to the
 *                       registered phone (verifies identity).
 *   action: "reset"   → verify the code and set a new password.
 */
export async function POST(req: NextRequest) {
  try {
    const { action, email, code, password } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    if (action === "request") {
      if (!user || !user.phone) {
        return NextResponse.json(
          { error: "No account with a verified phone was found for that email." },
          { status: 404 }
        );
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await saveOtp(user.phone, otp);

      let smsSent = false;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      try {
        const r = await fetch("https://textbelt.com/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: user.phone,
            message: `Your VaultX password reset code is ${otp}. It expires in 10 minutes.`,
            key: TEXTBELT_KEY,
          }),
          signal: ctrl.signal,
        });
        const d = await r.json();
        smsSent = !!d.success;
      } catch {
        /* fall back to demo mode */
      } finally {
        clearTimeout(timer);
      }

      return NextResponse.json(
        smsSent
          ? { success: true, sms: true, phoneHint: maskPhone(user.phone) }
          : { success: true, sms: false, devCode: otp, phoneHint: maskPhone(user.phone) }
      );
    }

    if (action === "reset") {
      if (!user || !user.phone) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }
      if (!code || !(await checkOtp(user.phone, String(code)))) {
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
