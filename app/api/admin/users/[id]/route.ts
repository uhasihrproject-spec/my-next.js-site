import { NextRequest, NextResponse } from "next/server";
import {
  getSessionByToken,
  getUserById,
  updateUser,
  deleteUser,
  sanitizeUser,
  type CoinKey,
} from "@/lib/db";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get("vaultx_session")?.value;
  if (!token) return null;
  const session = await getSessionByToken(token);
  if (!session) return null;
  const user = await getUserById(session.userId);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user: sanitizeUser(user) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  try {
    const body = await req.json();
    const {
      balance,
      earnings,
      addEarnings,
      withdrawalUnlockDate,
      customLock,
    } = body;

    if (balance !== undefined) {
      for (const coin of Object.keys(balance) as CoinKey[]) {
        user.balance[coin] = parseFloat(balance[coin]) || 0;
      }
    }

    if (earnings !== undefined) {
      for (const coin of Object.keys(earnings) as CoinKey[]) {
        user.earnings[coin] = parseFloat(earnings[coin]) || 0;
      }
    }

    if (addEarnings !== undefined) {
      for (const coin of Object.keys(addEarnings) as CoinKey[]) {
        const add = parseFloat(addEarnings[coin]) || 0;
        user.earnings[coin] = (user.earnings[coin] || 0) + add;
      }
    }

    if (withdrawalUnlockDate !== undefined) {
      user.withdrawalUnlockDate = withdrawalUnlockDate || null;
    }

    if (customLock !== undefined) {
      user.customLock = Boolean(customLock);
    }

    await updateUser(user);
    return NextResponse.json({ success: true, user: sanitizeUser(user) });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.role === "admin") {
    return NextResponse.json({ error: "Admin accounts cannot be deleted" }, { status: 400 });
  }
  await deleteUser(id);
  return NextResponse.json({ success: true });
}
