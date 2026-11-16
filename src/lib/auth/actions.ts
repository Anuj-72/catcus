"use server";

import { redirect } from "next/navigation";
import { addUser, emailExists, findUser, passwordsMatch } from "./mock-db";
import { createSession, destroySession } from "./session";
import { validateSignup } from "./validation";

/**
 * Server Actions for the mock auth flow. `useActionState` gives each form
 * either an error message or the values the user already typed.
 */

export type AuthState = {
  error?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

const BAD_CREDENTIALS = "Email and/or Password is wrong";

export async function loginAction(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";

  const user = findUser(email);
  // Same message for an unknown email and a wrong password: never reveal which.
  if (!user || !passwordsMatch(user, password)) {
    return { error: BAD_CREDENTIALS, email };
  }

  await createSession({ email: user.email, name: user.name }, remember);
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

  if (emailExists(email)) {
    return { error: "An account with this email already exists.", ...values };
  }

  const user = addUser({ name: `${firstName} ${lastName}`, email, password });
  await createSession({ email: user.email, name: user.name });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
