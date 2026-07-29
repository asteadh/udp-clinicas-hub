import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HubBadge, HubCard, HubEmptyState, HubSectionHeader } from "@hubnegocios/ui";
import { ArticleCard } from "@/components/article-card";
import { ClinicIcon } from "@/components/clinic-icon";
import { CtaBanner } from "@/components/cta-banner";
import { FaqList } from "@/components/faq-list";
import { GalleryGrid } from "@/components/gallery-grid";
import { TeamGrid } from "@/components/team-grid";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const clinic = await api.clinic(slug).catch(() => null);
  return { title: clinic ? `${clinic.name} — Hub Negocios UDP` : copy.clinics.notFoundTitle };
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <HubBadge>{count}</HubBadge>
    </div>
  );
}

export default async function ClinicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clinic = await api.clinic(slug).catch(() => null);
  if (!clinic) {
    notFound();
  }

  const [faqs, team, gallery, articles] = await Promise.all([
    api.clinicFaqs(slug).catch(() => []),
    api.clinicTeam(slug).catch(() => []),
    api.clinicGallery(slug).catch(() => []),
    api.clinicArticles(slug).catch(() => []),
  ]);

  const color = clinic.colorPrimary || undefined;

  return (
    <div className="grid gap-12">
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            flexShrink: 0,
            borderRadius: "9999px",
            display: "grid",
            placeItems: "center",
            background: color ? `color-mix(in srgb, ${color} 18%, transparent)` : "var(--hub-blue-soft)",
          }}
        >
          <ClinicIcon icon={clinic.icon} size={28} color={color || "var(--hub-deep-blue)"} />
        </div>
        <HubSectionHeader eyebrow={clinic.name} title={clinic.name}>
          {clinic.shortDescription}
        </HubSectionHeader>
      </div>
      {clinic.descriptionHtml && <div dangerouslySetInnerHTML={{ __html: clinic.descriptionHtml }} />}

      <HubCard style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h3 style={{ margin: 0 }}>{copy.clinics.ctaCardTitle}</h3>
          <p style={{ color: "var(--hub-muted)", margin: "0.35rem 0 0" }}>{copy.clinics.ctaCardBody}</p>
        </div>
        <Link href={`/ingreso?clinica=${clinic.slug}`} className="hub-button hub-button--primary">
          {copy.clinics.ctaCardButton}
        </Link>
      </HubCard>

      <section>
        <SectionTitle title={copy.clinics.faqsTitle} count={faqs.length} />
        {faqs.length ? <FaqList faqs={faqs} /> : <HubEmptyState title={copy.clinics.faqsTitle} description={copy.clinics.noFaqs} />}
      </section>

      <section>
        <SectionTitle title={copy.clinics.teamTitle} count={team.length} />
        {team.length ? <TeamGrid team={team} /> : <HubEmptyState title={copy.clinics.teamTitle} description={copy.clinics.noTeam} />}
      </section>

      <section>
        <SectionTitle title={copy.clinics.galleryTitle} count={gallery.length} />
        {gallery.length ? <GalleryGrid albums={gallery} /> : <HubEmptyState title={copy.clinics.galleryTitle} description={copy.clinics.noGallery} />}
      </section>

      <section>
        <SectionTitle title={copy.clinics.articlesTitle} count={articles.length} />
        {articles.length ? (
          <div className="hub-grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} copy={copy} />
            ))}
          </div>
        ) : (
          <HubEmptyState title={copy.clinics.articlesTitle} description={copy.clinics.noArticles} />
        )}
      </section>

      <CtaBanner
        title={copy.home.ctaBanner.title}
        subtitle={copy.home.ctaBanner.subtitle}
        primaryHref={`/ingreso?clinica=${clinic.slug}`}
        primaryLabel={copy.home.ctaBanner.primaryCta}
        secondaryHref="/contacto"
        secondaryLabel={copy.home.ctaBanner.secondaryCta}
      />
    </div>
  );
}
