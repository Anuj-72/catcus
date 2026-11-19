import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  verifySessionToken,
  type SessionUser,
} from "./jwt";

export { SESSION_COOKIE, verifySessionToken, type SessionUser };

/**
 * Store the backend token unchanged. Server Actions only.
 * `maxAgeSeconds` comes from the backend's `expires_in`.
 */
export async function createSession(
  token: string,
  maxAgeSeconds: number,
): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

/** Raw cookie value. Unverified: only pass it to the backend or after the proxy. */
export async function readSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function readSession(): Promise<SessionUser | null> {
  const token = await readSessionToken();
  if (!token) return null;
  return verifySessionToken(token);
}

/** Server Actions and Route Handlers only; Server Components cannot mutate cookies. */
export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}