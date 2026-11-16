import styles from "./SocialButton.module.css";

export function SocialButton({ children }: { children: React.ReactNode }) {
  return (
    // TODO: OAuth — both providers are no-ops in the mock-auth build.
    <button type="button" className={`u-dm ${styles.button}`}>
      {children}
    </button>
  );
}
