import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { CART_COOKIE } from "@/lib/constants";

export type CartItem = {
  kind: "photo" | "album";
  id: string;
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function encodeCart(items: CartItem[]): string {
  const json = JSON.stringify(items);
  const encoded = Buffer.from(json).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

function decodeCart(token: string): CartItem[] | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const encoded = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const expected = sign(encoded);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as CartItem[];
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (item) =>
        (item.kind === "photo" || item.kind === "album") &&
        typeof item.id === "string",
    );
  } catch {
    return null;
  }
}

export async function getCartItems(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_COOKIE)?.value;
  if (!token) return [];
  return decodeCart(token) ?? [];
}

export async function setCartItems(items: CartItem[]): Promise<void> {
  const cookieStore = await cookies();
  const unique = items.filter(
    (item, index, arr) =>
      arr.findIndex((i) => i.kind === item.kind && i.id === item.id) === index,
  );
  if (unique.length === 0) {
    cookieStore.delete(CART_COOKIE);
    return;
  }
  cookieStore.set(CART_COOKIE, encodeCart(unique), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function parseCartCookie(token: string | undefined): CartItem[] {
  if (!token) return [];
  return decodeCart(token) ?? [];
}
