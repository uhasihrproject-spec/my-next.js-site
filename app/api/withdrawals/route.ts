import { NextRequest, NextResponse } from "next/server";
import {
  getSessionByToken,
  getUserById,
  updateUser,
  generateId,
  getSettings,
  canWithdraw,
  type CoinKey,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("vaultx_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await getSessionByToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserById(session.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const settings = await getSettings();
  const { allowed, reason } = canWithdraw(user, settings);
  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 403 });
  }

  try {
    const { coin, amount, address } = await req.json();

    if (!coin || !amount || !address) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const supportedCoins = ["BTC", "ETH", "USDT", "BNB", "SOL", "USDC"];
    if (!supportedCoins.includes(coin)) {
      return NextResponse.json({ error: "Unsupported coin" }, { status: 400 });
    }

    const coinBalance = (user.balance[coin as CoinKey] || 0) + (user.earnings[coin as CoinKey] || 0);
    if (parseFloat(amount) > coinBalance) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    const withdrawal = {
      id: generateId(),
      coin: coin as CoinKey,
      amount: parseFloat(amount),
      address: address.trim(),
      status: "pending" as const,
      requestDate: new Date().toISOString(),
    };

    user.withdrawals.push(withdrawal);
    await updateUser(user);

    return NextResponse.json({ success: true, withdrawal });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
