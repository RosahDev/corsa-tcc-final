import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";

export type SessionPayload = {
  userId: string;
  role: "buyer" | "photographer" | "admin";
  exp: number;
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function encodeToken(payload: SessionPayload): string {
  const body = `${payload.userId}.${payload.role}.${payload.exp}`;
  return `${body}.${sign(body)}`;
}

function decodeToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [userId, role, expStr, signature] = parts;
  if (role !== "buyer" && role !== "photographer" && role !== "admin") return null;
  const body = `${userId}.${role}.${expStr}`;
  const expected = sign(body);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return null;
  return { userId, role, exp };
}

export function parseSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  return decodeToken(token);
}

export async function createSession(
  userId: string,
  role: "buyer" | "photographer" | "admin",
): Promise<void> {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = encodeToken({ userId, role, exp });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return parseSessionToken(token);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
