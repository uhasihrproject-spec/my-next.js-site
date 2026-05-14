import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken, getUserById, getUsers, updateUser } from "@/lib/db";

function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("vaultx_session")?.value;
  if (!token) return null;
  const session = getSessionByToken(token);
  if (!session) return null;
  const user = getUserById(session.userId);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = getUsers().filter((u) => u.role !== "admin");
  const withdrawals = users.flatMap((u) =>
    u.withdrawals.map((w) => ({
      ...w,
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
    }))
  );
  withdrawals.sort(
    (a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
  );
  return NextResponse.json({ withdrawals });
}

export async function PUT(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { userId, withdrawalId, action, note } = await req.json();
    if (!userId || !withdrawalId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = getUserById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const withdrawal = user.withdrawals.find((w) => w.id === withdrawalId);
    if (!withdrawal)
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });

    if (action === "process") {
      withdrawal.status = "processing";
    } else if (action === "complete") {
      withdrawal.status = "completed";
      withdrawal.processedDate = new Date().toISOString();
      const coinBalance = user.balance[withdrawal.coin] || 0;
      const coinEarnings = user.earnings[withdrawal.coin] || 0;
      const totalAvailable = coinBalance + coinEarnings;
      const deduct = Math.min(withdrawal.amount, totalAvailable);
      let remaining = deduct;
      const earnDeduct = Math.min(remaining, coinEarnings);
      user.earnings[withdrawal.coin] = coinEarnings - earnDeduct;
      remaining -= earnDeduct;
      user.balance[withdrawal.coin] = Math.max(0, coinBalance - remaining);
    } else if (action === "reject") {
      withdrawal.status = "rejected";
      withdrawal.processedDate = new Date().toISOString();
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (note) withdrawal.note = note;
    updateUser(user);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
