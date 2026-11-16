import styles from "./Checkbox.module.css";

type CheckboxProps = {
  id: string;
  name: string;
  children: React.ReactNode;
  defaultChecked?: boolean;
};

/**
 * T&C / Remember Me row: a real checkbox (visually hidden) plus the 40 Figma px
 * (20 CSS) square from the component set, and the exported tick when checked.
 */
export function Checkbox({
  id,
  name,
  children,
  defaultChecked,
}: CheckboxProps) {
  return (
    <label className={`u-dm ${styles.row}`} htmlFor={id}>
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className={styles.native}
      />
      <span className={styles.box} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/check-icon.svg" alt="" className={styles.tick} />
      </span>
      <span className={styles.text}>{children}</span>
    </label>
  );
}
