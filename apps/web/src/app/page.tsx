import Link from "next/link";
import { HubBrandMark, HubSectionHeader, HubStatCard } from "@hubnegocios/ui";
import { ArticleCard } from "@/components/article-card";
import { ClinicCard } from "@/components/clinic-card";
import { CtaBanner } from "@/components/cta-banner";
import { HowItWorks } from "@/components/how-it-works";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

const statTones = ["gold", "blue", "mint", "coral"] as const;

export default async function HomePage() {
  const [clinics, articles] = await Promise.all([
    api.clinics().catch(() => []),
    api.articles(1).catch(() => []),
  ]);

  const [featuredArticle, ...restArticles] = articles;

  return (
    <div className="grid gap-12">
      <section className="hub-hero">
        <div>
          <HubSectionHeader eyebrow={copy.home.eyebrow} title={copy.home.title}>
            {copy.home.subtitle}
          </HubSectionHeader>
          <div className="hub-actions">
            <Link href="/ingreso" className="hub-button hub-button--primary hub-button--lg">
              {copy.home.cta}
            </Link>
            <Link href="/clinicas" className="hub-button hub-button--outline hub-button--lg">
              {copy.home.heroSecondaryCta}
            </Link>
          </div>
        </div>
        <div className="hub-hero__art">
          <HubBrandMark width={320} height={320} />
        </div>
      </section>

      <section className="hub-grid">
        {copy.home.stats.map((stat, index) => (
          <HubStatCard key={stat.label} label={stat.label} value={stat.value} tone={statTones[index % statTones.length]} />
        ))}
      </section>

      <HowItWorks title={copy.home.howItWorks.title} subtitle={copy.home.howItWorks.subtitle} steps={copy.home.howItWorks.steps} />

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
          <div className="grid gap-4">
            {featuredArticle && (
              <div style={{ position: "relative" }}>
                <span className="hub-badge" style={{ position: "absolute", top: "0.75rem", left: "0.75rem", zIndex: 1 }}>
                  {copy.home.featuredLabel}
                </span>
                <ArticleCard article={featuredArticle} copy={copy} />
              </div>
            )}
            {restArticles.length > 0 && (
              <div className="hub-grid">
                {restArticles.slice(0, 2).map((article) => (
                  <ArticleCard key={article.id} article={article} copy={copy} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <CtaBanner
        title={copy.home.ctaBanner.title}
        subtitle={copy.home.ctaBanner.subtitle}
        primaryHref="/ingreso"
        primaryLabel={copy.home.ctaBanner.primaryCta}
        secondaryHref="/contacto"
        secondaryLabel={copy.home.ctaBanner.secondaryCta}
      />
    </div>
  );
}
