import { HubSectionHeader } from "@hubnegocios/ui";
import { ClinicCard } from "@/components/clinic-card";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clínicas — Hub Negocios UDP",
};

export default async function ClinicsPage() {
  const clinics = await api.clinics().catch(() => []);

  return (
    <div className="grid gap-8">
      <HubSectionHeader title={copy.clinics.title}>{copy.clinics.subtitle}</HubSectionHeader>
      <p style={{ color: "var(--hub-muted)", maxWidth: "760px", marginTop: "-1rem" }}>{copy.clinics.intro}</p>
      <div className="hub-grid">
        {clinics.map((clinic) => (
          <ClinicCard key={clinic.slug} clinic={clinic} copy={copy} />
        ))}
      </div>
    </div>
  );
}
