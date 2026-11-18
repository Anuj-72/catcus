"use server";

import { redirect } from "next/navigation";
import {
  BackendError,
  authenticateUser,
  registerUser,
} from "./backend";
import { createSession, destroySession } from "./session";
import { validateSignup } from "./validation";

/**
 * Server Actions are the browser-facing auth API (BFF). They call the private
 * FastAPI service, then issue the HttpOnly Next.js session cookie.
 */

export type AuthState = {
  error?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

const BAD_CREDENTIALS = "Email and/or Password is wrong";
const UNREACHABLE = "Could not reach the server. Please try again.";
const SIGNUP_FAILED = "Could not create your account. Please try again.";
const SIGNUP_REJECTED = "Check your details and try again.";
const LOGIN_FAILED = "Could not sign you in. Please try again.";

function signupError(error: unknown): string {
  if (!(error instanceof BackendError)) return SIGNUP_FAILED;
  if (error.kind === "unreachable") return UNREACHABLE;
  if (error.kind === "email_taken") {
    return "An account with this email already exists.";
  }
  if (error.status === 422) return SIGNUP_REJECTED;
  return SIGNUP_FAILED;
}

function loginError(error: unknown): string {
  if (!(error instanceof BackendError)) return LOGIN_FAILED;
  if (error.kind === "unreachable") return UNREACHABLE;
  // The backend returns 401 for both unknown email and wrong password.
  if (error.kind === "invalid_credentials" || error.status === 422) {
    return BAD_CREDENTIALS;
  }
  return LOGIN_FAILED;
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  if (!email || !password) {
    return { error: BAD_CREDENTIALS, email };
  }

  try {
    const user = await authenticateUser({ email, password });
    await createSession({ email: user.email, name: user.full_name }, remember);
  } catch (error) {
    return { error: loginError(error), email };
  }

  // Must stay outside the try block: redirect() works by throwing.
  redirect("/dashboard");
}

export async function signupAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const acceptedTerms = formData.get("terms") === "on";

  const values = { firstName, lastName, email };

  const validationError = validateSignup({
    firstName,
    lastName,
    email,
    password,
    acceptedTerms,
  });
  if (validationError) return { error: validationError, ...values };

  try {
    const user = await registerUser({
      full_name: `${firstName} ${lastName}`,
      email,
      password,
    });
    await createSession({ email: user.email, name: user.full_name });
  } catch (error) {
    return { error: signupError(error), ...values };
  }

  // Must stay outside the try block: redirect() works by throwing.
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}