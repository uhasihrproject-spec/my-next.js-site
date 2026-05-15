import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken, getUserById, getSettings } from "@/lib/db";

/**
 * Public-safe settings endpoint for authenticated users.
 * Returns only the fields a user needs to operate (deposit wallets, lock state).
 * Excludes admin-only fields like adminEmail or defaultWithdrawalLockDays.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get("vaultx_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await getSessionByToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserById(session.userId);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const s = await getSettings();
  return NextResponse.json({
    settings: {
      globalWithdrawalLock: s.globalWithdrawalLock,
      globalWithdrawalLockReason: s.globalWithdrawalLockReason,
      adminWallets: s.adminWallets,
      siteName: s.siteName,
    },
  });
}
