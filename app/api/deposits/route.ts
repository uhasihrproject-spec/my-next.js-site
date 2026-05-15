import { NextRequest, NextResponse } from "next/server";
import {
  getSessionByToken,
  getUserById,
  updateUser,
  generateId,
  getSettings,
  type CoinKey,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("vaultx_session")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await getSessionByToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserById(session.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const { coin, amount, txHash } = await req.json();

    if (!coin || !amount || !txHash) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const settings = await getSettings();
    const supportedCoins = ["BTC", "ETH", "USDT", "BNB", "SOL", "USDC"];
    if (!supportedCoins.includes(coin)) {
      return NextResponse.json({ error: "Unsupported coin" }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    if (!settings.adminWallets[coin as CoinKey]) {
      return NextResponse.json(
        { error: "No wallet address configured for this coin. Contact support." },
        { status: 400 }
      );
    }

    const deposit = {
      id: generateId(),
      coin: coin as CoinKey,
      amount: parseFloat(amount),
      txHash: txHash.trim(),
      status: "pending" as const,
      date: new Date().toISOString(),
    };

    user.deposits.push(deposit);
    await updateUser(user);

    return NextResponse.json({ success: true, deposit });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
