import { HubBadge, HubCard, HubSectionHeader } from "@hubnegocios/ui";
import { ClinicIcon } from "@/components/clinic-icon";
import { ContactForm } from "@/components/contact-form";
import { HowItWorks } from "@/components/how-it-works";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contacto — Hub Negocios UDP",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ clinica?: string }>;
}) {
  const { clinica } = await searchParams;
  const clinics = await api.clinics().catch(() => []);
  const selectedClinic = clinica ? clinics.find((clinic) => clinic.slug === clinica) : undefined;

  return (
    <div className="grid gap-8">
      <HubSectionHeader title={copy.contact.title}>{copy.contact.subtitle}</HubSectionHeader>
      <div className="form-with-sidebar">
        <div className="grid gap-4">
          {selectedClinic && (
            <HubCard style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <ClinicIcon icon={selectedClinic.icon} size={22} color={selectedClinic.colorPrimary || undefined} />
              <div>
                <strong>{selectedClinic.name}</strong>
                <p style={{ color: "var(--hub-muted)", margin: 0 }}>{selectedClinic.shortDescription}</p>
              </div>
              <HubBadge style={{ marginLeft: "auto" }}>{copy.clinics.badgeFreeService}</HubBadge>
            </HubCard>
          )}
          <ContactForm clinics={clinics} copy={copy} defaultClinicSlug={clinica} />
        </div>
        <HubCard className="grid gap-4">
          <h3 style={{ margin: 0 }}>{copy.contact.sidebarTitle}</h3>
          <HowItWorks steps={copy.home.howItWorks.steps} />
          <p style={{ color: "var(--hub-muted)", fontSize: "0.85rem" }}>{copy.contact.privacyNote}</p>
        </HubCard>
      </div>
    </div>
  );
}
