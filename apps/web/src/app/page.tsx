import Link from "next/link";
import { HubSectionHeader } from "@hubnegocios/ui";
import { ArticleCard } from "@/components/article-card";
import { ClinicCard } from "@/components/clinic-card";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [clinics, articles] = await Promise.all([
    api.clinics().catch(() => []),
    api.articles(1).catch(() => []),
  ]);

  return (
    <div className="grid gap-12">
      <section className="hub-hero">
        <HubSectionHeader eyebrow={copy.home.eyebrow} title={copy.home.title}>
          {copy.home.subtitle}
        </HubSectionHeader>
        <Link href="/contacto" className="hub-button hub-button--primary hub-button--lg" style={{ display: "inline-flex", width: "fit-content" }}>
          {copy.home.cta}
        </Link>
      </section>

      <section>
        <HubSectionHeader title={copy.home.clinicsTitle}>{copy.home.clinicsSubtitle}</HubSectionHeader>
        <div className="hub-grid">
          {clinics.map((clinic) => (
            <ClinicCard key={clinic.slug} clinic={clinic} copy={copy} />
          ))}
        </div>
      </section>

      {articles.length > 0 && (
        <section>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <HubSectionHeader title={copy.home.articlesTitle} />
            <Link href="/articulos" className="hub-button hub-button--link">
              {copy.home.viewAll}
            </Link>
          </div>
          <div className="hub-grid">
            {articles.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} copy={copy} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
