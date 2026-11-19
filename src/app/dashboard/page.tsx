import { redirect } from "next/navigation";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { BackendError, getCurrentUser } from "@/lib/auth/backend";
import { readSessionToken, verifySessionToken } from "@/lib/auth/session";
import styles from "./Dashboard.module.css";

export default async function DashboardPage() {
  const token = await readSessionToken();
  if (!token) redirect("/login");

  let name: string;
  let email: string;

  try {
    // The backend is the authority: a revoked or deleted-user token fails here.
    const user = await getCurrentUser(token);
    name = user.full_name;
    email = user.email;
  } catch (error) {
    if (error instanceof BackendError && error.kind === "invalid_token") {
      // Server Components cannot delete cookies; this route handler can.
      redirect("/api/auth/clear-session");
    }

    // Backend outage: keep the locally verified session rather than signing
    // everyone out. Revocation cannot be checked until the API is back.
    const session = await verifySessionToken(token);
    if (!session) redirect("/api/auth/clear-session");

    console.error("auth: /auth/me unavailable; using verified session", error);
    name = session.name;
    email = session.email;
  }

  return (
    <main className={styles.stage}>
      <Sidebar />
      <WelcomeBanner />
      <HeaderBar name={name} email={email} />
      <AccountCard name={name} email={email} />
      <LogoutButton />
    </main>
  );
}