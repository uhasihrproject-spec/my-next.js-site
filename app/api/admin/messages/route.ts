import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getMessages, saveMessages, createMessage, getUserById } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const messages = getMessages();

    // Group by userId
    const userMap = new Map<
      string,
      {
        userId: string;
        userName: string;
        userEmail: string;
        messages: typeof messages;
        unread: number;
        lastAt: string;
      }
    >();

    for (const m of messages) {
      if (!userMap.has(m.userId)) {
        userMap.set(m.userId, {
          userId: m.userId,
          userName: m.userName,
          userEmail: m.userEmail,
          messages: [],
          unread: 0,
          lastAt: m.createdAt,
        });
      }
      const entry = userMap.get(m.userId)!;
      entry.messages.push(m);
      if (m.from === "user" && !m.read) entry.unread++;
      if (m.createdAt > entry.lastAt) entry.lastAt = m.createdAt;
    }

    const conversations = Array.from(userMap.values()).sort(
      (a, b) => b.lastAt.localeCompare(a.lastAt)
    );
    const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

    return NextResponse.json({ conversations, totalUnread });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { userId, text, markRead } = await req.json();

    if (markRead) {
      const all = getMessages();
      all.forEach((m) => {
        if (m.userId === userId && m.from === "user") m.read = true;
      });
      saveMessages(all);
      return NextResponse.json({ ok: true });
    }

    if (!text?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }
    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const message = createMessage({
      userId,
      userName: user.name,
      userEmail: user.email,
      text: text.trim(),
      from: "admin",
      read: false,
    });
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
