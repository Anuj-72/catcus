import styles from "./LeftCard.module.css";

export type LeftCardVariant = "default" | "variant2" | "variant3";

type Ellipse = { file: string; left: number; top: number; size: number };

/**
 * The three ellipses are the only difference between the Left Card variants
 * (STYLE.md §4.1). Positions are CSS px, card-relative, and already include the
 * 31.3 Figma px (15.65 CSS px) blur bleed baked into each exported SVG.
 */
const ELLIPSES: Record<LeftCardVariant, Ellipse[]> = {
  default: [
    { file: "ellipse-2", left: 262.35, top: 500.85, size: 306.3 },
    { file: "ellipse-3", left: 12.85, top: 98.85, size: 181.3 },
    { file: "ellipse-1", left: 363.85, top: 43.85, size: 441.3 },
  ],
  variant2: [
    { file: "ellipse-2", left: 182.35, top: 513.85, size: 306.3 },
    { file: "ellipse-3", left: 11.85, top: 67.35, size: 181.3 },
    { file: "ellipse-1", left: 294.35, top: 34.35, size: 441.3 },
  ],
  variant3: [
    { file: "ellipse-2", left: 334.35, top: 560.85, size: 306.3 },
    { file: "ellipse-3", left: -0.65, top: 264.35, size: 181.3 },
    { file: "ellipse-1", left: 226.85, top: 67.35, size: 441.3 },
  ],
};

const u = (value: number) => `calc(${value} * var(--u))`;

export function LeftCard({
  variant = "default",
}: {
  variant?: LeftCardVariant;
}) {
  return (
    <div className={styles.card}>
      {ELLIPSES[variant].map((ellipse) => (
        // eslint-disable-next-line @next/next/no-img-element -- SVG with filters must stay pixel-sized
        <img
          key={ellipse.file}
          src={`/assets/${ellipse.file}.svg`}
          alt=""
          aria-hidden="true"
          className={styles.ellipse}
          style={{
            left: u(ellipse.left),
            top: u(ellipse.top),
            width: u(ellipse.size),
            height: u(ellipse.size),
          }}
        />
      ))}

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

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/main-logo.svg"
        alt=""
        aria-hidden="true"
        className={styles.logo}
      />

      <p className={`u-marcellus ${styles.headline}`}>Building things</p>

      <div className={styles.frame5}>
        <span className={`u-marcellus ${styles.that}`}>that</span>
        <span className={`u-pinyon ${styles.matter}`}>Matter ...</span>
      </div>
    </div>
  );
}
