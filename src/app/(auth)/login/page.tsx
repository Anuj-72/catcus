import { LoginForm } from "@/components/auth/LoginForm";

/**
 * `/login?state=error` renders the designed error state without submitting, so
 * it can be screenshot-compared with Figma frame 33:70. Development only.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const initialError =
    process.env.NODE_ENV !== "production" && params?.state === "error";

  return <LoginForm initialError={initialError} />;
}
