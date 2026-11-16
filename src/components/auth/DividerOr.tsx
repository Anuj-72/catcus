import styles from "./DividerOr.module.css";

/**
 * The "Or sign in with" rule. In Figma the two LINE nodes are one continuous
 * 1050 Figma px rule rotated +0.577 degrees, interrupted by the label, so the
 * halves are drawn as rotated rules rather than a border-top.
 */
export function DividerOr({ label }: { label: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.line} aria-hidden="true" />
      <span className={`u-dm ${styles.label}`}>{label}</span>
      <span className={`${styles.line} ${styles.lineRight}`} aria-hidden="true" />
    </div>
  );
}
