import { initialsFor } from "@/lib/auth/user";
import styles from "./HeaderBar.module.css";

export function HeaderBar({ name, email }: { name: string; email: string }) {
  return (
    <header className={styles.header}>
      <h1 className={`u-manrope ${styles.title}`}>Overview</h1>

      <div className={styles.right}>
        <div className={`u-manrope ${styles.avatar}`} aria-hidden="true">
          {initialsFor(name, email)}
        </div>
        <div className={styles.user}>
          <span className={`u-manrope ${styles.userName}`}>{name}</span>
          <span className={`u-manrope ${styles.userEmail}`}>{email}</span>
        </div>
      </div>
    </header>
  );
}
