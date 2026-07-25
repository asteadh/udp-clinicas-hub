"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function HubChoiceChip({
  active,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`hub-chip ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function HubSegmented<T extends string>({
  value,
  options,
  onChange,
  className = "",
}: {
  value: T;
  options: Array<{ value: T; label: ReactNode }>;
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div className={`hub-segmented ${className}`.trim()}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
