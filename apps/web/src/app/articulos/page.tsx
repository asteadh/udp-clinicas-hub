import { HubEmptyState, HubSectionHeader } from "@hubnegocios/ui";
import { ArticleCard } from "@/components/article-card";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Artículos — Hub Negocios UDP",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;
  const articles = await api.articles(page).catch(() => []);

  return (
    <div className="grid gap-8">
      <HubSectionHeader title={copy.articles.title}>{copy.articles.subtitle}</HubSectionHeader>
      {articles.length ? (
        <div className="hub-grid">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} copy={copy} />
          ))}
        </div>
      ) : (
        <HubEmptyState title={copy.articles.title} description={copy.articles.noArticles} />
      )}
    </div>
  );
}
