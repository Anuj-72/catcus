import { cookies } from "next/headers";
import {
  ONE_HOUR,
  SESSION_COOKIE,
  THIRTY_DAYS,
  signSession,
  verifySessionToken,
  type SessionUser,
} from "./jwt";

export { SESSION_COOKIE, verifySessionToken, type SessionUser };

export function sessionMaxAge(remember: boolean): number {
  return remember ? THIRTY_DAYS : ONE_HOUR;
}

/** Sign a session and write it to an httpOnly cookie. Server Actions only. */
export async function createSession(
  user: SessionUser,
  remember = false,
): Promise<void> {
  const maxAge = sessionMaxAge(remember);
  const token = await signSession(user, maxAge);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function readSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
