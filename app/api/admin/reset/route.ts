import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken, getUserById, resetPlatformData } from "@/lib/db";

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
 * Wipe all platform data — user accounts, deposits, withdrawals, chat
 * messages and OTP codes. Admin accounts and settings are kept.
 * Admin only; requires `confirm: "RESET"` in the body as a safety check.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { confirm } = await req.json();
    if (confirm !== "RESET") {
      return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
    }
    await resetPlatformData();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
