import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("vaultx_session")?.value;
  if (token) await deleteSession(token);

  const response = NextResponse.json({ success: true });
  response.cookies.set("vaultx_session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
