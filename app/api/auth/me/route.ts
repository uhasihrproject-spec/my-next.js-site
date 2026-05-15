import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken, getUserById, sanitizeUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("vaultx_session")?.value;
  if (!token) return NextResponse.json({ user: null });

  const session = await getSessionByToken(token);
  if (!session) return NextResponse.json({ user: null });

  const user = await getUserById(session.userId);
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: sanitizeUser(user),
    hasPin: !!user.pin,
    phoneVerified: !!user.phoneVerified,
  });
}
