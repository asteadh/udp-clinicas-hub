import Link from "next/link";

export function CtaBanner({
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  subtitle?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section
      className="hub-card"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.5rem",
        background: "color-mix(in srgb, var(--hub-blue) 8%, var(--hub-surface))",
      }}
    >
      <div>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ color: "var(--hub-muted)", margin: "0.35rem 0 0" }}>{subtitle}</p>}
      </div>
      <div className="hub-actions">
        <Link href={primaryHref} className="hub-button hub-button--primary">
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel && (
          <Link href={secondaryHref} className="hub-button hub-button--outline">
            {secondaryLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
