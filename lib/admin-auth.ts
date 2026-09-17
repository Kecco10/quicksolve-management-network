import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "qmn_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET non configurata.");
  }

  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export async function createAdminSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
      scope: "qmn-admin",
    })
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) return false;

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  const expected = sign(payload);

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as {
      exp?: number;
      scope?: string;
    };

    return (
      parsed.scope === "qmn-admin" &&
      typeof parsed.exp === "number" &&
      parsed.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(request: NextRequest) {
  return verifyAdminSessionToken(
    request.cookies.get(ADMIN_COOKIE_NAME)?.value
  );
}