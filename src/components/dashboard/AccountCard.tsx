import styles from "./AccountCard.module.css";

export function AccountCard({ name, email }: { name: string; email: string }) {
  return (
    <section className={styles.card}>
      <h2 className={`u-manrope ${styles.heading}`}>Account details</h2>
      <p className={`u-dm ${styles.caption}`}>
        The information associated with your account.
      </p>

      <div className={styles.divider} aria-hidden="true" />

      <h3 className={`u-dm ${styles.label} ${styles.nameLabel}`}>NAME</h3>
      <p className={`u-dm ${styles.value} ${styles.nameValue}`}>{name}</p>

      <h3 className={`u-dm ${styles.label} ${styles.emailLabel}`}>EMAIL</h3>
      <p className={`u-dm ${styles.value} ${styles.emailValue}`}>{email}</p>
    </section>
  );
}
