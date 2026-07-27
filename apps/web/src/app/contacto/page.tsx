import { HubSectionHeader } from "@hubnegocios/ui";
import { ContactForm } from "@/components/contact-form";
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

  return (
    <div className="grid gap-8" style={{ maxWidth: "560px" }}>
      <HubSectionHeader title={copy.contact.title}>{copy.contact.subtitle}</HubSectionHeader>
      <ContactForm clinics={clinics} copy={copy} defaultClinicSlug={clinica} />
    </div>
  );
}
