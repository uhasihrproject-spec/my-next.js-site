import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getMessagesByUser, createMessage, getMessages, saveMessages } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();
    // Mark all admin messages to this user as read
    const all = getMessages();
    let changed = false;
    all.forEach((m) => {
      if (m.userId === user.id && m.from === "admin" && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) saveMessages(all);
    const messages = getMessagesByUser(user.id);
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }
    const message = createMessage({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      text: text.trim(),
      from: "user",
      read: false,
    });
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
