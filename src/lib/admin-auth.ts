import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sj_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function secret() {
  return `${process.env.ADMIN_PASSWORD ?? ""}::${process.env.ADMIN_SECRET ?? "small-joys"}`;
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array) {
  return Buffer.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)).toString("base64url");
}

async function hmac(data: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare HMACs so timing doesn't reveal the password length.
  return safeEqual(await hmac(`pw:${input}`), await hmac(`pw:${expected}`));
}

export async function createAdminToken() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = `v1.${exp}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function verifyAdminToken(token: string | undefined | null) {
  if (!token || !adminConfigured()) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  return safeEqual(parts[2]!, await hmac(`${parts[0]}.${parts[1]}`));
}

export async function isAdmin() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
