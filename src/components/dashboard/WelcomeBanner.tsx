import styles from "./WelcomeBanner.module.css";

export function WelcomeBanner() {
  return (
    <section className={styles.banner}>
      <h2 className={`u-manrope ${styles.title}`}>Your space is ready.</h2>
      {/* Figma clips this paragraph to one line; we show all of it (DEVIATIONS.md). */}
      <p className={`u-dm ${styles.body}`}>
        {"Welcome to Cactus. This is your starting"}
        <br />
        {"point — a simple space that is yours."}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/dashboard-logo.svg"
        alt=""
        aria-hidden="true"
        className={styles.logo}
      />
    </section>
  );
}
