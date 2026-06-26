import crypto from "crypto";
import { logger } from "@/lib/logger";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const KEY_ITERATIONS = 100000;
const KEY_LENGTH = 32;

// ذاكرة تخزين مؤقت لمفاتيح PBKDF2 — لا تغير الخوارزمية ولا الأمان
// تخزين المفتاح المشتق لكل salt لمنع إعادة الحساب لنفس salt
const keyCache = new Map<string, Buffer>();
const MAX_CACHE_SIZE = parseInt(process.env.PBKDF2_CACHE_SIZE || "500", 10);

function getKey(salt: Buffer): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }
  const saltHex = salt.toString("hex");
  const cached = keyCache.get(saltHex);
  if (cached) return cached;
  const derived = crypto.pbkdf2Sync(key, salt, KEY_ITERATIONS, KEY_LENGTH, "sha512");
  if (keyCache.size >= MAX_CACHE_SIZE) {
    const firstKey = keyCache.keys().next().value;
    if (firstKey) keyCache.delete(firstKey);
  }
  keyCache.set(saltHex, derived);
  return derived;
}

export function encryptMessage(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(salt), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return salt.toString("hex") + ":" + iv.toString("hex") + ":" + encrypted;
}

export function decryptMessage(encryptedText: string): string {
  try {
    const parts = encryptedText.split(":");
    // format قديم: iv:encrypted (جزئين) — format جديد: salt:iv:encrypted (ثلاثة أجزاء)
    const isNewFormat = parts.length >= 3;
    const saltHex = isNewFormat ? parts.shift()! : null;
    const ivHex = parts.shift()!;
    const salt = saltHex ? Buffer.from(saltHex, "hex") : Buffer.from("cyber-security-salt-2024", "utf8");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = parts.join(":");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(salt), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    logger.warn("Decryption failed", { error: String(error) });
    return "[رسالة مشفرة - تعذر فك التشفير]";
  }
}
