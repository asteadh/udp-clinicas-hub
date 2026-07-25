"use client";

export function HubSwitch({
  checked,
  onChange,
  disabled = false,
  label,
  className = "",
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`hub-switch ${className}`.trim()}
      onClick={() => onChange?.(!checked)}
    />
  );
}
