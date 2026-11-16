"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "@/lib/auth/actions";
import { Checkbox } from "@/components/ui/Checkbox";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SocialButton } from "@/components/ui/SocialButton";
import { TextField } from "@/components/ui/TextField";
import { DividerOr } from "./DividerOr";
import styles from "./LoginForm.module.css";

const INITIAL: AuthState = {};
const BAD_CREDENTIALS = "Email and/or Password is wrong";

export function LoginForm({ initialError = false }: { initialError?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const error = state.error ?? (initialError ? BAD_CREDENTIALS : undefined);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <div className={styles.heading}>
        <h1 className={`u-manrope ${styles.title}`}>Welcome Back</h1>
        <p className={`u-dm ${styles.subtitle}`}>
          New to Catcus?{" "}
          <Link href="/signup" className={styles.link}>
            Create Account
          </Link>
        </p>
      </div>

      <div className={styles.fields}>
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="someone@example.com"
          autoComplete="email"
          defaultValue={state.email}
          error={Boolean(error)}
          required
        />
        <TextField
          id="password"
          name="password"
          type="password"
          label="Password here"
          placeholder="Password@12"
          autoComplete="current-password"
          error={Boolean(error)}
          required
        />
      </div>

      <div className={styles.remember}>
        <Checkbox id="remember" name="remember">
          Remember Me.
        </Checkbox>
      </div>

      {error ? (
        <p id="form-error" role="alert" className={`u-dm ${styles.error}`}>
          {error}
        </p>
      ) : null}

      <div className={styles.ctaGroup}>
        <PrimaryButton className={styles.ctaButton} aria-busy={pending}>
          Sign In
        </PrimaryButton>
        <div className={styles.divider}>
          <DividerOr label="Or sign in with" />
        </div>
        <div className={styles.socials}>
          <SocialButton>Or sign in with Google</SocialButton>
          <SocialButton>Or sign in with GitHub</SocialButton>
        </div>
      </div>
    </form>
  );
}
