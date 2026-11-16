import { logoutAction } from "@/lib/auth/actions";
import styles from "./LogoutButton.module.css";

/** Logout is a plain form + Server Action, so it works without client JS. */
export function LogoutButton() {
  return (
    <form action={logoutAction} className={styles.positioner}>
      <button type="submit" className={`u-manrope ${styles.button}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logout-icon.svg"
          alt=""
          aria-hidden="true"
          className={styles.icon}
        />
        <span>Logout</span>
      </button>
    </form>
  );
}
