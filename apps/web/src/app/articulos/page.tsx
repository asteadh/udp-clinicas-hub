import Link from "next/link";
import { HubEmptyState, HubSectionHeader } from "@hubnegocios/ui";
import { ArticleCard } from "@/components/article-card";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Artículos — Hub Negocios UDP",
};

const PAGE_SIZE = 20;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;
  const articles = await api.articles(page).catch(() => []);
  const hasNext = articles.length === PAGE_SIZE;

  return (
    <div className="grid gap-8">
      <HubSectionHeader title={copy.articles.title}>{copy.articles.subtitle}</HubSectionHeader>
      {articles.length ? (
        <>
          <div className="hub-grid">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} copy={copy} />
            ))}
          </div>
          <div className="hub-actions" style={{ justifyContent: "center" }}>
            {page > 1 && (
              <Link href={`/articulos?page=${page - 1}`} className="hub-button hub-button--outline">
                {copy.articles.prev}
              </Link>
            )}
            {hasNext && (
              <Link href={`/articulos?page=${page + 1}`} className="hub-button hub-button--outline">
                {copy.articles.next}
              </Link>
            )}
          </div>
        </>
      ) : (
        <HubEmptyState title={copy.articles.title} description={copy.articles.noArticles} />
      )}
    </div>
  );
}
