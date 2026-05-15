import { cookies } from "next/headers";
import { getSessionByToken, getUserById, type User } from "./db";

export async function getAuthUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("vaultx_session")?.value;
    if (!token) return null;
    const session = getSessionByToken(token);
    if (!session) return null;
    return getUserById(session.userId) ?? null;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getAuthUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== "admin") throw new Error("Forbidden");
  return user;
}
