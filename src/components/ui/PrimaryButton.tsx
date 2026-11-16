import styles from "./PrimaryButton.module.css";

export function PrimaryButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={`u-dm ${styles.button}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
