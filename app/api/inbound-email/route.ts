import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { addInboundEmail } from "@/lib/db";
import { cleanEnv } from "@/lib/notify";

/**
 * Resend inbound-email webhook receiver.
 *
 * Resend signs every webhook with Svix-style headers (`svix-id`,
 * `svix-timestamp`, `svix-signature`). We verify the signature using
 * the `RESEND_WEBHOOK_SECRET` from the Resend dashboard.
 *
 *   1. Resend dashboard → Webhooks → Add endpoint
 *      URL:    https://appvaultx.com/api/inbound-email
 *      Events: select `email.received` (the inbound event)
 *   2. Copy the "Signing secret" Resend shows you — it starts with `whsec_`
 *   3. Paste it into Netlify env vars as RESEND_WEBHOOK_SECRET
 *
 * When the secret isn't configured the route still ingests messages but
 * logs a warning — useful in local dev. In production, set the secret.
 */

// Tell Next.js to give us the raw body so signature verification works.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ResendInboundPayload {
  // Resend's actual shape: { type, created_at, data: { from, to, subject, text, html, headers? } }
  type?: string;
  created_at?: string;
  data?: {
    from?: string | { email?: string; name?: string };
    to?: string | string[] | { email?: string }[];
    subject?: string;
    text?: string;
    html?: string;
    headers?: Record<string, string>;
  };
}

function verifySvixSignature(
  secret: string,
  svixId: string | null,
  svixTs: string | null,
  svixSig: string | null,
  rawBody: string
): boolean {
  if (!secret || !svixId || !svixTs || !svixSig) return false;

  // Svix signatures look like "v1,base64sig v1,base64sig2"
  // Their secret is "whsec_<base64>" — base64-decode after stripping prefix.
  const secretB64 = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let secretBytes: Buffer;
  try { secretBytes = Buffer.from(secretB64, "base64"); } catch { return false; }

  const signedPayload = `${svixId}.${svixTs}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secretBytes).update(signedPayload).digest("base64");

  // Each space-separated entry is "vN,base64sig". Match any of them.
  return svixSig.split(" ").some((entry) => {
    const sig = entry.split(",")[1];
    if (!sig) return false;
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

/** Pull a friendly name + bare email out of "Name <addr>" or just "addr". */
function parseAddress(raw: string | { email?: string; name?: string } | undefined):
  { name?: string; address: string }
{
  if (!raw) return { address: "" };
  if (typeof raw === "object") {
    return { name: raw.name, address: raw.email || "" };
  }
  const m = raw.match(/^\s*(?:"?([^"<]+?)"?\s*)?<([^>]+)>\s*$/);
  if (m) return { name: (m[1] || "").trim() || undefined, address: m[2].trim() };
  return { address: raw.trim() };
}

function parseTo(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "string") return parseAddress(raw).address;
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (!first) return "";
    if (typeof first === "string") return parseAddress(first).address;
    if (typeof first === "object" && first !== null && "email" in first) {
      const e = (first as { email?: unknown }).email;
      return typeof e === "string" ? e : "";
    }
    return "";
  }
  return "";
}

export async function POST(req: NextRequest) {
  const secret = cleanEnv(process.env.RESEND_WEBHOOK_SECRET);
  const svixId = req.headers.get("svix-id");
  const svixTs = req.headers.get("svix-timestamp");
  const svixSig = req.headers.get("svix-signature");

  // Read the raw body — needed for signature verification.
  const rawBody = await req.text();

  if (secret) {
    const ok = verifySvixSignature(secret, svixId, svixTs, svixSig, rawBody);
    if (!ok) {
      console.warn("[inbound-email] Invalid Svix signature — rejecting request.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn("[inbound-email] RESEND_WEBHOOK_SECRET is not set — accepting unverified payloads (dev only).");
  }

  let payload: ResendInboundPayload;
  try {
    payload = JSON.parse(rawBody) as ResendInboundPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Resend may emit a few event types; filter for the inbound one.
  const type = payload.type || "";
  const isInbound =
    type === "email.received" ||
    type === "inbound.email" ||
    type === "inbound.received" ||
    type.startsWith("email.received");
  if (!isInbound) {
    // ACK so Resend doesn't keep retrying — we just don't store non-inbound events.
    return NextResponse.json({ ok: true, skipped: type });
  }

  const data = payload.data || {};
  const fromParsed = parseAddress(data.from);
  const toAddress = parseTo(data.to);
  const subject = String(data.subject || "(no subject)").slice(0, 500);
  const text = String(data.text || "").slice(0, 50_000);
  const html = data.html ? String(data.html).slice(0, 200_000) : undefined;

  if (!fromParsed.address) {
    return NextResponse.json({ ok: true, skipped: "missing-from" });
  }

  const stored = await addInboundEmail({
    from: data.from ? (typeof data.from === "string" ? data.from : `${fromParsed.name || ""} <${fromParsed.address}>`.trim()) : fromParsed.address,
    fromName: fromParsed.name,
    fromAddress: fromParsed.address,
    to: toAddress,
    subject,
    text,
    html,
  });

  return NextResponse.json({ ok: true, id: stored.id });
}

/** Lets you visit the URL in a browser to confirm the route exists. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "inbound-email webhook",
    method: "POST",
    secretConfigured: !!cleanEnv(process.env.RESEND_WEBHOOK_SECRET),
  });
}
