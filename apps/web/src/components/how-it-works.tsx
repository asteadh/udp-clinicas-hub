import { HubCard } from "@hubnegocios/ui";

export function HowItWorks({
  title,
  subtitle,
  steps,
}: {
  title?: string;
  subtitle?: string;
  steps: readonly { title: string; description: string }[];
}) {
  return (
    <section>
      {title && <h2 style={{ marginBottom: subtitle ? "0.35rem" : "1rem" }}>{title}</h2>}
      {subtitle && <p style={{ color: "var(--hub-muted)", marginBottom: "1rem" }}>{subtitle}</p>}
      <div className="hub-grid">
        {steps.map((step, index) => (
          <HubCard key={step.title}>
            <span
              className="hub-badge"
              style={{ marginBottom: "0.6rem", fontVariantNumeric: "tabular-nums" }}
            >
              {index + 1}
            </span>
            <h3>{step.title}</h3>
            <p style={{ color: "var(--hub-muted)" }}>{step.description}</p>
          </HubCard>
        ))}
      </div>
    </section>
  );
}
