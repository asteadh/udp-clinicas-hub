import { HubSectionHeader } from "@hubnegocios/ui";
import { IntakeForm } from "@/components/intake-form";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ingreso — Hub Negocios UDP",
};

export default async function IntakePage({
  searchParams,
}: {
  searchParams: Promise<{ clinica?: string }>;
}) {
  const { clinica } = await searchParams;
  const clinics = await api.clinics().catch(() => []);

  return (
    <div className="grid gap-8" style={{ maxWidth: "560px" }}>
      <HubSectionHeader title={copy.intake.title}>{copy.intake.subtitle}</HubSectionHeader>
      <IntakeForm clinics={clinics} copy={copy} defaultClinicSlug={clinica} />
    </div>
  );
}
