import { jwtVerify } from "jose";

/**
 * Backend-issued JWT verification. Kept free of `next/headers` so the proxy
 * (edge runtime) can verify tokens with the same code the Node server uses.
 */

export const SESSION_COOKIE = "catcus_session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  jti: string;
  expiresAt: number;
};

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    // Fail loudly rather than trusting a guessable key.
    throw new Error(
      "JWT_SECRET is missing or shorter than 32 characters. It must match backend/.env.",
    );
  }
  return new TextEncoder().encode(secret);
}

function expectedIssuer(): string {
  return process.env.JWT_ISSUER ?? "catcus-api";
}

function expectedAudience(): string {
  return process.env.JWT_AUDIENCE ?? "catcus-web";
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      issuer: expectedIssuer(),
      audience: expectedAudience(),
    });
    const { sub, email, name, jti, exp } = payload;
    if (
      typeof sub !== "string" ||
      typeof email !== "string" ||
      typeof name !== "string" ||
      typeof jti !== "string" ||
      typeof exp !== "number"
    ) {
      return null;
    }
    return { id: sub, email, name, jti, expiresAt: exp };
  } catch {
    // Expired, tampered with, wrong issuer/audience, or signed with another
    // key: treat as signed out.
    return null;
  }
}