import styles from "./Sidebar.module.css";

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/ellipse-1.svg"
        alt=""
        aria-hidden="true"
        className={styles.ellipse}
      />

      <div className={styles.lockup}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/brand-mark.svg"
          alt=""
          aria-hidden="true"
          className={styles.mark}
        />
        <span className={`u-manrope ${styles.wordmark}`}>CATCUS</span>
      </div>

      <p className={`u-dm ${styles.overline}`}>YOUR WORKSPACE</p>

      <div className={styles.activeNav}>
        <span className={styles.dot} aria-hidden="true" />
        <span className={`u-dm ${styles.navLabel}`}>Overview</span>
      </div>

      <p className={`u-manrope ${styles.note}`}>
        A calm place to
        <br />
        keep growing.
      </p>
    </aside>
  );
}
