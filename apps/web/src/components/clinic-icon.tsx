import { Briefcase, Calculator, Lightbulb, Scale } from "lucide-react";
import type { LucideProps } from "lucide-react";

const iconsBySlug = {
  scale: Scale,
  lightbulb: Lightbulb,
  briefcase: Briefcase,
  calculator: Calculator,
} as const;

export function ClinicIcon({ icon, ...props }: { icon?: string } & LucideProps) {
  const Icon = iconsBySlug[icon as keyof typeof iconsBySlug] ?? Scale;
  return <Icon {...props} />;
}
