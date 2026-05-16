import { NextRequest, NextResponse } from "next/server";
import {
  getSessionByToken,
  getUserById,
  getUsers,
  updateUser,
  getSettings,
} from "@/lib/db";
import { sendEmail, emailLayout } from "@/lib/notify";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("vaultx_session")?.value;
  if (!token) return null;
  const session = await getSessionByToken(token);
  if (!session) return null;
  const user = await getUserById(session.userId);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = (await getUsers()).filter((u) => u.role !== "admin");
  const deposits = users.flatMap((u) =>
    u.deposits.map((d) => ({ ...d, userId: u.id, userName: u.name, userEmail: u.email }))
  );
  deposits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json({ deposits });
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { userId, depositId, action, note } = await req.json();
    if (!userId || !depositId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const deposit = user.deposits.find((d) => d.id === depositId);
    if (!deposit) return NextResponse.json({ error: "Deposit not found" }, { status: 404 });

    if (action === "confirm") {
      deposit.status = "confirmed";
      if (note) deposit.note = note;
      user.balance[deposit.coin] = (user.balance[deposit.coin] || 0) + deposit.amount;

      const settings = await getSettings();
      if (settings.defaultWithdrawalLockDays > 0 && !user.withdrawalUnlockDate) {
        const unlock = new Date();
        unlock.setDate(unlock.getDate() + settings.defaultWithdrawalLockDays);
        user.withdrawalUnlockDate = unlock.toISOString();
      }
    } else if (action === "reject") {
      deposit.status = "rejected";
      if (note) deposit.note = note;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await updateUser(user);

    if (action === "confirm") {
      await sendEmail(user.email, "Deposit confirmed — VaultX",
        emailLayout("Deposit confirmed",
          `Your deposit of <b style="color:#fff">${deposit.amount} ${deposit.coin}</b> has been confirmed and credited to your account. It's now earning.`));
    } else {
      await sendEmail(user.email, "Deposit update — VaultX",
        emailLayout("Deposit not approved",
          `Your deposit of <b style="color:#fff">${deposit.amount} ${deposit.coin}</b> could not be approved.${note ? ` Note from our team: "${note}".` : ""} Please contact support if you have questions.`));
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
