import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken, getUserById, updateUser, hashPassword } from "@/lib/db";

async function currentUser(req: NextRequest) {
  const token = req.cookies.get("vaultx_session")?.value;
  if (!token) return null;
  const session = await getSessionByToken(token);
  if (!session) return null;
  return (await getUserById(session.userId)) || null;
}

function hashPin(pin: string) {
  return hashPassword("pin:" + pin);
}

/**
 * Security PIN endpoint.
 *   action: "set"    → store a new 6-digit PIN (hashed) for the signed-in user
 *   action: "verify" → check a PIN against the stored hash
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, pin } = await req.json();
    if (!pin || !/^\d{6}$/.test(String(pin))) {
      return NextResponse.json({ error: "PIN must be exactly 6 digits" }, { status: 400 });
    }

    if (action === "set") {
      await updateUser({ ...user, pin: hashPin(String(pin)) });
      return NextResponse.json({ success: true });
    }

    if (action === "verify") {
      if (!user.pin) {
        return NextResponse.json({ error: "No PIN has been set" }, { status: 400 });
      }
      if (user.pin !== hashPin(String(pin))) {
        return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
