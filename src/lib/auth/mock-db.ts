import { createHash, timingSafeEqual } from "node:crypto";

/**
 * MOCK user store. There is no database in this task: accounts live in memory
 * on the server process and disappear on restart. Swap this module's internals
 * when a real backend arrives; keep the function signatures.
 */

export type MockUser = {
  name: string;
  email: string;
  password: string;
};

/** Seeded demo account (matches the placeholder copy in the design). */
export const SEEDED_USER: MockUser = {
  name: "Andrew Martin",
  email: "andrewmartin@catcus.com",
  password: "Password@12",
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

type UserStore = Map<string, MockUser>;

// Hanging the store on globalThis keeps accounts alive across dev HMR reloads.
const globalStore = globalThis as typeof globalThis & {
  __catcusUserStore?: UserStore;
};

const store: UserStore = (globalStore.__catcusUserStore ??= new Map([
  [SEEDED_USER.email, SEEDED_USER],
]));

export function findUser(email: string): MockUser | undefined {
  return store.get(normalizeEmail(email));
}

export function emailExists(email: string): boolean {
  return store.has(normalizeEmail(email));
}

export function addUser(input: {
  name: string;
  email: string;
  password: string;
}): MockUser {
  const user: MockUser = {
    name: input.name,
    email: normalizeEmail(input.email),
    password: input.password,
  };
  store.set(user.email, user);
  return user;
}

/**
 * Mock-only comparison. Both sides are hashed first so the compare is
 * constant-time and does not leak the stored password's length.
 */
export function passwordsMatch(user: MockUser, candidate: string): boolean {
  const a = createHash("sha256").update(user.password).digest();
  const b = createHash("sha256").update(candidate).digest();
  return timingSafeEqual(a, b);
}
