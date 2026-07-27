import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubEmptyState, HubSectionHeader } from "@hubnegocios/ui";
import { ArticleCard } from "@/components/article-card";
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

  return (
    <div className="grid gap-12">
      <HubSectionHeader eyebrow={clinic.name} title={clinic.name}>
        {clinic.shortDescription}
      </HubSectionHeader>
      {clinic.descriptionHtml && <div dangerouslySetInnerHTML={{ __html: clinic.descriptionHtml }} />}

      <section>
        <HubSectionHeader title={copy.clinics.faqsTitle} />
        {faqs.length ? <FaqList faqs={faqs} /> : <HubEmptyState title={copy.clinics.faqsTitle} description={copy.clinics.noFaqs} />}
      </section>

      <section>
        <HubSectionHeader title={copy.clinics.teamTitle} />
        {team.length ? <TeamGrid team={team} /> : <HubEmptyState title={copy.clinics.teamTitle} description={copy.clinics.noTeam} />}
      </section>

      <section>
        <HubSectionHeader title={copy.clinics.galleryTitle} />
        {gallery.length ? <GalleryGrid albums={gallery} /> : <HubEmptyState title={copy.clinics.galleryTitle} description={copy.clinics.noGallery} />}
      </section>

      <section>
        <HubSectionHeader title={copy.clinics.articlesTitle} />
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
    </div>
  );
}
