import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");

export type CoinKey = "BTC" | "ETH" | "USDT" | "BNB" | "SOL" | "USDC";

export const SUPPORTED_COINS: CoinKey[] = ["BTC", "ETH", "USDT", "BNB", "SOL", "USDC"];

export const COIN_LABELS: Record<CoinKey, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether",
  BNB: "BNB",
  SOL: "Solana",
  USDC: "USD Coin",
};

export const COIN_COLORS: Record<CoinKey, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  USDT: "#26a17b",
  BNB: "#f0b90b",
  SOL: "#9945ff",
  USDC: "#2775ca",
};

export interface Deposit {
  id: string;
  coin: CoinKey;
  amount: number;
  txHash: string;
  status: "pending" | "confirmed" | "rejected";
  note?: string;
  date: string;
}

export interface Withdrawal {
  id: string;
  coin: CoinKey;
  amount: number;
  address: string;
  status: "pending" | "processing" | "completed" | "rejected";
  note?: string;
  requestDate: string;
  processedDate?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  balance: Partial<Record<CoinKey, number>>;
  earnings: Partial<Record<CoinKey, number>>;
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  withdrawalUnlockDate: string | null;
  customLock: boolean;
  createdAt: string;
  /* ─ Optional profile / security fields ─ */
  phone?: string;
  country?: string;
  dob?: string;
  pin?: string;            // hashed 6-digit PIN
  phoneVerified?: boolean;
  faceVerified?: boolean;
}

export interface Settings {
  globalWithdrawalLock: boolean;
  globalWithdrawalLockReason: string;
  defaultWithdrawalLockDays: number;
  adminWallets: Partial<Record<CoinKey, string>>;
  siteName: string;
  adminEmail: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readFile<T>(filename: string, defaultValue: T): T {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, "utf-8").trim();
    if (!content) return defaultValue;
    return JSON.parse(content);
  } catch {
    return defaultValue;
  }
}

function writeFile<T>(filename: string, data: T): void {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password + "vaultx-salt-2024")
    .digest("hex");
}

const DEFAULT_SETTINGS: Settings = {
  globalWithdrawalLock: false,
  globalWithdrawalLockReason: "",
  defaultWithdrawalLockDays: 30,
  adminWallets: {},
  siteName: "VaultX",
  adminEmail: "admin@vaultx.com",
};

// ─── Users ───────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  let users = readFile<User[]>("users.json", []);
  if (!users.some((u) => u.role === "admin")) {
    const admin: User = {
      id: generateId(),
      name: "Admin",
      email: process.env.ADMIN_EMAIL || "admin@vaultx.com",
      password: hashPassword(process.env.ADMIN_PASSWORD || "Admin2024!"),
      role: "admin",
      balance: {},
      earnings: {},
      deposits: [],
      withdrawals: [],
      withdrawalUnlockDate: null,
      customLock: false,
      createdAt: new Date().toISOString(),
    };
    users = [admin, ...users];
    writeFile("users.json", users);
  }
  return users;
}

export function saveUsers(users: User[]): void {
  writeFile("users.json", users);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

export function updateUser(updated: User): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx !== -1) {
    users[idx] = updated;
    saveUsers(users);
  }
}

export function createUser(
  data: Omit<User, "id" | "createdAt">
): User {
  const user: User = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  return user;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export function getSettings(): Settings {
  return readFile<Settings>("settings.json", DEFAULT_SETTINGS);
}

export function saveSettings(settings: Settings): void {
  writeFile("settings.json", settings);
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export function getSessions(): Session[] {
  return readFile<Session[]>("sessions.json", []);
}

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const sessions = getSessions();
  const others = sessions.filter((s) => s.userId !== userId);
  const mine = sessions.filter((s) => s.userId === userId).slice(-4);
  writeFile("sessions.json", [
    ...others,
    ...mine,
    { token, userId, createdAt: new Date().toISOString() },
  ]);
  return token;
}

export function getSessionByToken(token: string): Session | undefined {
  return getSessions().find((s) => s.token === token);
}

export function deleteSession(token: string): void {
  writeFile(
    "sessions.json",
    getSessions().filter((s) => s.token !== token)
  );
}

// ─── Business Logic ───────────────────────────────────────────────────────────

export function canWithdraw(
  user: User,
  settings: Settings
): { allowed: boolean; reason?: string } {
  if (settings.globalWithdrawalLock) {
    return {
      allowed: false,
      reason:
        settings.globalWithdrawalLockReason ||
        "Withdrawals are temporarily disabled by the administrator.",
    };
  }
  if (user.customLock) {
    return {
      allowed: false,
      reason: "Your account withdrawals have been locked by the administrator.",
    };
  }
  if (user.withdrawalUnlockDate) {
    const unlock = new Date(user.withdrawalUnlockDate);
    if (unlock > new Date()) {
      return {
        allowed: false,
        reason: `Withdrawals unlock on ${unlock.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}.`,
      };
    }
  }
  return { allowed: true };
}

export function sanitizeUser(user: User): Omit<User, "password" | "pin"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, pin: _pin, ...rest } = user;
  return rest;
}

// ─── Phone OTP (one-time codes) ───────────────────────────────────────────────

interface OtpEntry {
  phone: string;
  code: string;
  expiresAt: number;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Store a 6-digit code for a phone number (10-minute expiry). */
export function saveOtp(phone: string, code: string): void {
  const key = normalizePhone(phone);
  const now = Date.now();
  const otps = readFile<OtpEntry[]>("otps.json", [])
    .filter((o) => o.phone !== key && o.expiresAt > now);
  otps.push({ phone: key, code, expiresAt: now + 10 * 60 * 1000 });
  writeFile("otps.json", otps);
}

/** Verify a code for a phone number. Consumes the code on success. */
export function checkOtp(phone: string, code: string): boolean {
  const key = normalizePhone(phone);
  const otps = readFile<OtpEntry[]>("otps.json", []);
  const entry = otps.find((o) => o.phone === key);
  if (!entry || entry.expiresAt < Date.now() || entry.code !== code) return false;
  writeFile("otps.json", otps.filter((o) => o.phone !== key));
  return true;
}

// ─── Chat Messages ────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
  from: "user" | "admin";
  createdAt: string;
  read: boolean;
}

export function getMessages(): ChatMessage[] {
  return readFile<ChatMessage[]>("messages.json", []);
}

export function saveMessages(messages: ChatMessage[]): void {
  writeFile("messages.json", messages);
}

export function getMessagesByUser(userId: string): ChatMessage[] {
  return getMessages().filter((m) => m.userId === userId);
}

export function createMessage(
  data: Omit<ChatMessage, "id" | "createdAt">
): ChatMessage {
  const message: ChatMessage = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const messages = getMessages();
  messages.push(message);
  saveMessages(messages);
  return message;
}
