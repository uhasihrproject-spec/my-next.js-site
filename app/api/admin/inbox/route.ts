import { NextRequest, NextResponse } from "next/server";
import {
  getSessionByToken, getUserById,
  getInboundEmails, getInboundEmailById,
  updateInboundEmail, deleteInboundEmail, generateId,
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

/** List all inbound emails (newest first). */
export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const emails = await getInboundEmails();
  const unread = emails.filter((e) => !e.read && !e.archived).length;
  return NextResponse.json({ emails, unread });
}

/** Update: mark as read / archive / unarchive. */
export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id, action, replyBody } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const email = await getInboundEmailById(id);
    if (!email) return NextResponse.json({ error: "Email not found" }, { status: 404 });

    if (action === "mark-read") {
      email.read = true;
    } else if (action === "mark-unread") {
      email.read = false;
    } else if (action === "archive") {
      email.archived = true;
    } else if (action === "unarchive") {
      email.archived = false;
    } else if (action === "reply") {
      if (!replyBody || typeof replyBody !== "string" || !replyBody.trim()) {
        return NextResponse.json({ error: "Reply body is required" }, { status: 400 });
      }
      // Compose the threaded reply email
      const subject = email.subject.toLowerCase().startsWith("re:")
        ? email.subject
        : `Re: ${email.subject}`;
      const safeBody = String(replyBody)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
      const quoted = email.text
        ? `<br><br><div style="margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.08);color:#9ca3af;font-size:13px;line-height:1.65;">On ${new Date(email.receivedAt).toUTCString()}, ${email.fromName || email.fromAddress} wrote:<br><blockquote style="margin:8px 0 0;padding-left:12px;border-left:2px solid rgba(255,255,255,0.12);color:#71717a;">${String(email.text).slice(0, 4000).replace(/\n/g, "<br>")}</blockquote></div>`
        : "";

      const result = await sendEmail(
        email.fromAddress,
        subject,
        emailLayout(subject, `${safeBody}${quoted}`)
      );
      if (!result.ok) {
        return NextResponse.json({ error: result.error || "Failed to send reply" }, { status: 502 });
      }

      email.replies = email.replies || [];
      email.replies.push({
        id: generateId(),
        body: replyBody,
        sentAt: new Date().toISOString(),
        from: admin.email,
      });
      email.read = true;
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    await updateInboundEmail(email);
    return NextResponse.json({ success: true, email });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** Delete an email permanently. */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await deleteInboundEmail(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
