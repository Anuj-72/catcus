import { SignJWT, jwtVerify } from "jose";

/**
 * JWT primitives. Kept free of `next/headers` so the proxy (edge runtime) can
 * verify tokens with the same code the Node server uses.
 */

export const SESSION_COOKIE = "catcus_session";
export const ONE_HOUR = 60 * 60;
export const THIRTY_DAYS = 60 * 60 * 24 * 30;

export type SessionUser = {
  email: string;
  name: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    // Fail loudly rather than signing sessions with a guessable key.
    throw new Error(
      "AUTH_SECRET is missing or shorter than 32 characters. Copy .env.example to .env.local and set one.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(
  user: SessionUser,
  maxAgeSeconds: number,
): Promise<string> {
  return new SignJWT({ name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.email)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    return {
      email: payload.sub,
      name: typeof payload.name === "string" ? payload.name : "",
    };
  } catch {
    // Expired, tampered with, or signed with another key: treat as signed out.
    return null;
  }
}
