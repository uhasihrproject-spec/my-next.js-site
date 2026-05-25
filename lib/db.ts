import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getStore } from "@netlify/blobs";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_NAME = "vaultx-data";

export type CoinKey =
  | "BTC" | "ETH" | "USDT" | "BNB" | "SOL" | "USDC"
  | "XRP" | "ADA" | "DOGE" | "TRX" | "AVAX" | "DOT"
  | "LINK" | "MATIC" | "LTC" | "BCH" | "SHIB" | "AAVE" | "UNI" | "XMR";

export const SUPPORTED_COINS: CoinKey[] = [
  "BTC", "ETH", "USDT", "BNB", "SOL", "USDC",
  "XRP", "ADA", "DOGE", "TRX", "AVAX", "DOT",
  "LINK", "MATIC", "LTC", "BCH", "SHIB", "AAVE", "UNI", "XMR",
];

export const COIN_LABELS: Record<CoinKey, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether",
  BNB: "BNB",
  SOL: "Solana",
  USDC: "USD Coin",
  XRP: "XRP",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  TRX: "TRON",
  AVAX: "Avalanche",
  DOT: "Polkadot",
  LINK: "Chainlink",
  MATIC: "Polygon",
  LTC: "Litecoin",
  BCH: "Bitcoin Cash",
  SHIB: "Shiba Inu",
  AAVE: "Aave",
  UNI: "Uniswap",
  XMR: "Monero",
};

export const COIN_COLORS: Record<CoinKey, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  USDT: "#26a17b",
  BNB: "#f0b90b",
  SOL: "#9945ff",
  USDC: "#2775ca",
  XRP: "#00aae4",
  ADA: "#0033ad",
  DOGE: "#c2a633",
  TRX: "#ff060a",
  AVAX: "#e84142",
  DOT: "#e6007a",
  LINK: "#2a5ada",
  MATIC: "#8247e5",
  LTC: "#345d9d",
  BCH: "#8dc351",
  SHIB: "#ffa409",
  AAVE: "#b6509e",
  UNI: "#ff007a",
  XMR: "#ff6600",
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
  /** Network/miner fee (in the same coin units), set by the admin on approval.
   *  Defaults to 0 when not set; the receipt always shows it. */
  networkFee?: number;
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

/* ─────────────────────────────────────────────────────────────────────────
   Persistence layer.

   In production on Netlify the filesystem is read-only, so data is stored in
   Netlify Blobs. Locally (and anywhere Blobs isn't configured) it transparently
   falls back to JSON files on disk — same behaviour as before.
   ───────────────────────────────────────────────────────────────────────── */

function fsEnsureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch { /* read-only filesystem — ignore */ }
}

function fsRead<T>(filename: string, defaultValue: T): T {
  try {
    fsEnsureDir();
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return defaultValue;
    const content = fs.readFileSync(filePath, "utf-8").trim();
    return content ? (JSON.parse(content) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function fsWrite<T>(filename: string, data: T): void {
  try {
    fsEnsureDir();
    fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2));
  } catch { /* read-only filesystem — ignore */ }
}

/** Read a JSON collection by key (Netlify Blobs, falling back to disk). */
async function readData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const value = await store.get(key, { type: "json" });
    if (value === null || value === undefined) {
      // Nothing stored yet — seed from any bundled JSON file, else default.
      return fsRead<T>(`${key}.json`, defaultValue);
    }
    return value as T;
  } catch {
    return fsRead<T>(`${key}.json`, defaultValue);
  }
}

/** Write a JSON collection by key (Netlify Blobs, falling back to disk). */
async function writeData<T>(key: string, data: T): Promise<void> {
  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    await store.setJSON(key, data);
  } catch {
    fsWrite(`${key}.json`, data);
  }
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
  // Pre-filled deposit addresses for fresh installs. The admin can edit these
  // in Admin → Settings → Deposit Wallets. Addresses left blank below need to
  // be entered there before users can deposit those coins.
  adminWallets: {
    BTC:  "3N3H8sgnUybVcAcC5LJRi59aUsgXWPNuAG",
    ETH:  "0x20eEE5034c3f0eEA40aD885Ced60A96C474039Fd",
    USDT: "",
    BNB:  "0xA4F5581C5E36F976A7182330089e37Be410666F2",
    SOL:  "2WykQpBi4hFXFQkZeW7TSHzScG4afaKgopZUCow76GsZ",
    USDC: "",
    XRP:  "rG153cxNJioRAHzow1u7v8AMBTvX1MKeS4",
    ADA:  "",
    DOGE: "D5GTDH6GbH9UNkQ9m7hXpL7pe7KtYttNi6",
    TRX:  "",
    AVAX: "",
    DOT:  "",
    LINK: "",
    MATIC: "",
    LTC:  "MFQGwr9KhPquRv613PxXr83U312Zd3sEfs",
    BCH:  "",
    SHIB: "0x13AD5a9406970aBb8f7A78a38DceD9B0f43c99C1",
    AAVE: "",
    UNI:  "0xB99378EC9b755f77bac3Fe706dBC746D54Ac9CF4",
    XMR:  "",
  },
  siteName: "VaultX",
  adminEmail: "admin@vaultx.com",
};

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  let users = await readData<User[]>("users", []);
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
    await writeData("users", users);
  }
  return users;
}

export async function saveUsers(users: User[]): Promise<void> {
  await writeData("users", users);
}

export async function getUserById(id: string): Promise<User | undefined> {
  return (await getUsers()).find((u) => u.id === id);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return (await getUsers()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

export async function updateUser(updated: User): Promise<void> {
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === updated.id);
  if (idx !== -1) {
    users[idx] = updated;
    await saveUsers(users);
  }
}

export async function createUser(
  data: Omit<User, "id" | "createdAt">
): Promise<User> {
  const user: User = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  const users = await getUsers();
  await saveUsers(users.filter((u) => u.id !== id));
  // Also drop any sessions for that user.
  const sessions = await getSessions();
  await writeData("sessions", sessions.filter((s) => s.userId !== id));
}

/**
 * Wipe all user accounts (and their deposits/withdrawals), chat messages and
 * one-time codes. Admin accounts, admin sessions and platform settings are
 * preserved so the admin stays signed in.
 */
export async function resetPlatformData(): Promise<void> {
  const users = await getUsers();
  const admins = users.filter((u) => u.role === "admin");
  await saveUsers(admins);
  const adminIds = new Set(admins.map((u) => u.id));
  const sessions = await getSessions();
  await writeData("sessions", sessions.filter((s) => adminIds.has(s.userId)));
  await writeData("messages", []);
  await writeData("otps", []);
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Settings> {
  return readData<Settings>("settings", DEFAULT_SETTINGS);
}

export async function saveSettings(settings: Settings): Promise<void> {
  await writeData("settings", settings);
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function getSessions(): Promise<Session[]> {
  return readData<Session[]>("sessions", []);
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const sessions = await getSessions();
  const others = sessions.filter((s) => s.userId !== userId);
  const mine = sessions.filter((s) => s.userId === userId).slice(-4);
  await writeData("sessions", [
    ...others,
    ...mine,
    { token, userId, createdAt: new Date().toISOString() },
  ]);
  return token;
}

export async function getSessionByToken(token: string): Promise<Session | undefined> {
  return (await getSessions()).find((s) => s.token === token);
}

export async function deleteSession(token: string): Promise<void> {
  await writeData(
    "sessions",
    (await getSessions()).filter((s) => s.token !== token)
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

/** Normalise an OTP identifier (email or phone) for stable lookup. */
function normalizeKey(s: string): string {
  return s.trim().toLowerCase();
}

/** Store a 6-digit code for an identifier (email/phone), 10-minute expiry. */
export async function saveOtp(identifier: string, code: string): Promise<void> {
  const key = normalizeKey(identifier);
  const now = Date.now();
  const otps = (await readData<OtpEntry[]>("otps", []))
    .filter((o) => o.phone !== key && o.expiresAt > now);
  otps.push({ phone: key, code, expiresAt: now + 10 * 60 * 1000 });
  await writeData("otps", otps);
}

/** Verify a code for an identifier. Consumes the code on success. */
export async function checkOtp(identifier: string, code: string): Promise<boolean> {
  const key = normalizeKey(identifier);
  const otps = await readData<OtpEntry[]>("otps", []);
  const entry = otps.find((o) => o.phone === key);
  if (!entry || entry.expiresAt < Date.now() || entry.code !== code) return false;
  await writeData("otps", otps.filter((o) => o.phone !== key));
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

export async function getMessages(): Promise<ChatMessage[]> {
  return readData<ChatMessage[]>("messages", []);
}

export async function saveMessages(messages: ChatMessage[]): Promise<void> {
  await writeData("messages", messages);
}

export async function getMessagesByUser(userId: string): Promise<ChatMessage[]> {
  return (await getMessages()).filter((m) => m.userId === userId);
}

export async function createMessage(
  data: Omit<ChatMessage, "id" | "createdAt">
): Promise<ChatMessage> {
  const message: ChatMessage = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  const messages = await getMessages();
  messages.push(message);
  await saveMessages(messages);
  return message;
}

/* ─── Inbound email inbox ─────────────────────────────────────────
   Emails delivered to @yourdomain that Resend POSTs to the webhook
   endpoint. Kept in the same Netlify Blob store as everything else.
   ─────────────────────────────────────────────────────────────────*/
export interface InboundEmail {
  id: string;
  /** Sender — `Name <addr@domain>` or just `addr@domain` */
  from: string;
  fromName?: string;
  fromAddress: string;
  /** Recipient address that the email was delivered to */
  to: string;
  subject: string;
  text: string;
  html?: string;
  receivedAt: string;
  read: boolean;
  archived?: boolean;
  /** Threaded replies sent from the admin panel */
  replies?: { id: string; body: string; sentAt: string; from: string }[];
}

export async function getInboundEmails(): Promise<InboundEmail[]> {
  return readData<InboundEmail[]>("inbound_emails", []);
}

export async function saveInboundEmails(emails: InboundEmail[]): Promise<void> {
  await writeData("inbound_emails", emails);
}

export async function addInboundEmail(
  email: Omit<InboundEmail, "id" | "receivedAt" | "read">
): Promise<InboundEmail> {
  const record: InboundEmail = {
    ...email,
    id: generateId(),
    receivedAt: new Date().toISOString(),
    read: false,
  };
  const list = await getInboundEmails();
  list.unshift(record);                          // newest first
  // Bound the inbox so the blob doesn't grow unbounded
  await saveInboundEmails(list.slice(0, 1000));
  return record;
}

export async function getInboundEmailById(id: string): Promise<InboundEmail | undefined> {
  return (await getInboundEmails()).find((e) => e.id === id);
}

export async function updateInboundEmail(updated: InboundEmail): Promise<void> {
  const list = await getInboundEmails();
  const i = list.findIndex((e) => e.id === updated.id);
  if (i === -1) return;
  list[i] = updated;
  await saveInboundEmails(list);
}

export async function deleteInboundEmail(id: string): Promise<void> {
  const list = await getInboundEmails();
  await saveInboundEmails(list.filter((e) => e.id !== id));
}
