import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken, getUserById, getUsers, sanitizeUser } from "@/lib/db";

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
  return NextResponse.json({ users: users.map(sanitizeUser) });
}
