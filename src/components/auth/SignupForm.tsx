"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction, type AuthState } from "@/lib/auth/actions";
import { Checkbox } from "@/components/ui/Checkbox";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SocialButton } from "@/components/ui/SocialButton";
import { TextField } from "@/components/ui/TextField";
import { DividerOr } from "./DividerOr";
import styles from "./SignupForm.module.css";

const INITIAL: AuthState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, INITIAL);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <div className={styles.heading}>
        <h1 className={`u-manrope ${styles.title}`}>Create your account</h1>
        <p className={`u-dm ${styles.subtitle}`}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>
            Log in
          </Link>
        </p>
      </div>

      <div className={styles.inputs}>
        <div className={styles.nameRow}>
          <TextField
            id="firstName"
            name="firstName"
            placeholder="First Name"
            srOnlyLabel="First name"
            autoComplete="given-name"
            defaultValue={state.firstName}
            required
          />
          <TextField
            id="lastName"
            name="lastName"
            placeholder="Last Name"
            srOnlyLabel="Last name"
            autoComplete="family-name"
            defaultValue={state.lastName}
            required
          />
        </div>
        <TextField
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          srOnlyLabel="Email"
          autoComplete="email"
          defaultValue={state.email}
          required
        />
        <TextField
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          srOnlyLabel="Password"
          autoComplete="new-password"
          required
        />
        <Checkbox id="terms" name="terms">
          I agree to:{" "}
          <a href="#" className={styles.termsLink}>
            Terms &amp; Conditions
          </a>
        </Checkbox>

        {state.error ? (
          <p id="form-error" role="alert" className={`u-dm ${styles.error}`}>
            {state.error}
          </p>
        ) : null}
      </div>

      <div className={styles.ctaGroup}>
        <PrimaryButton aria-busy={pending}>Create account</PrimaryButton>
        <DividerOr label="Or sign in with" />
        <div className={styles.socials}>
          <SocialButton>Continue with Google</SocialButton>
          <SocialButton>Continue with GitHub</SocialButton>
        </div>
      </div>
    </form>
  );
}
