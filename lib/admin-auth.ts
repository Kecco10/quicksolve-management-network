import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "qs_admin_auth";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

const encoder = new TextEncoder();

function getAdminSecret() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error("Credenziali admin non configurate.");
  }

  return `${username}:${password}`;
}

async function getSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getAdminSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
    return null;
  }

  const bytes = new Uint8Array(hex.length / 2);

  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}

export async function createAdminSessionToken() {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  const payload = `v1.${expiresAt}`;
  const key = await getSigningKey();

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  return `${payload}.${bytesToHex(new Uint8Array(signature))}`;
}

export async function verifyAdminSessionToken(token: string | undefined) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [version, expiresAtRaw, signatureHex] = parts;

  if (version !== "v1") return false;

  const expiresAt = Number(expiresAtRaw);

  if (!Number.isInteger(expiresAt)) return false;
  if (expiresAt <= Math.floor(Date.now() / 1000)) return false;

  const signature = hexToBytes(signatureHex);
  if (!signature) return false;

  const payload = `${version}.${expiresAtRaw}`;
  const key = await getSigningKey();

  return crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    encoder.encode(payload)
  );
}

export async function isAdminAuthenticated(request: NextRequest) {
  return verifyAdminSessionToken(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value
  );
}
