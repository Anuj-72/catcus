import styles from "./TextField.module.css";

type TextFieldProps = {
  id: string;
  name: string;
  placeholder: string;
  type?: "text" | "email" | "password";
  /** Visible label (Login). Omit for the placeholder-only Create Account form. */
  label?: string;
  /** Accessible-only label for the placeholder-only form. */
  srOnlyLabel?: string;
  autoComplete?: string;
  error?: boolean;
  defaultValue?: string;
  required?: boolean;
};

export function TextField({
  id,
  name,
  placeholder,
  type = "text",
  label,
  srOnlyLabel,
  autoComplete,
  error = false,
  defaultValue,
  required,
}: TextFieldProps) {
  const labelText = label ?? srOnlyLabel ?? placeholder;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={label ? `u-dm ${styles.label}` : "sr-only"}>
        {labelText}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error || undefined}
        aria-describedby={error ? "form-error" : undefined}
        className={`u-dm ${styles.input}${error ? ` ${styles.invalid}` : ""}`}
      />
    </div>
  );
}
