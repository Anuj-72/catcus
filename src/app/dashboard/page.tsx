import { redirect } from "next/navigation";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { readSession } from "@/lib/auth/session";
import styles from "./Dashboard.module.css";

export default async function DashboardPage() {
  // Verified again on the server: the proxy check is not the only gate.
  const session = await readSession();
  if (!session) redirect("/login");

  return (
    <main className={styles.stage}>
      <Sidebar />
      <WelcomeBanner />
      <HeaderBar name={session.name} email={session.email} />
      <AccountCard name={session.name} email={session.email} />
      <LogoutButton />
    </main>
  );
}
