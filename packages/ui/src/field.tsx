import type { InputHTMLAttributes } from "react";

export function HubField({
  label,
  helper,
  error,
  labelHidden = false,
  className = "",
  inputClassName = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helper?: string;
  error?: string;
  labelHidden?: boolean;
  inputClassName?: string;
}) {
  return (
    <label className={`hub-field ${className}`.trim()}>
      <span className={labelHidden ? "sr-only" : undefined}>{label}</span>
      <input
        className={inputClassName || undefined}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {helper && !error && <small>{helper}</small>}
      {error && <small className="hub-field__error">{error}</small>}
    </label>
  );
}
