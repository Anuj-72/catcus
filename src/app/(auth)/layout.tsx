import { LeftCard } from "@/components/auth/LeftCard";
import styles from "./AuthLayout.module.css";

/** Shared shell for Create Account, Login and the Login error state. */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className={styles.stage}>
      <LeftCard />
      <div className={styles.panel}>{children}</div>
    </main>
  );
}
