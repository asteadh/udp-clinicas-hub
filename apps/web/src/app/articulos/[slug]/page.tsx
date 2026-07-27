import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await api.article(slug).catch(() => null);
  return { title: article ? `${article.title} — Hub Negocios UDP` : copy.articles.notFoundTitle };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await api.article(slug).catch(() => null);
  if (!article) {
    notFound();
  }

  const image = article.coverImageUrl ? api.storageUrl(article.coverImageUrl) : "";

  return (
    <article className="grid gap-6" style={{ maxWidth: "760px" }}>
      <Link href="/articulos" className="hub-button hub-button--link" style={{ width: "fit-content" }}>
        {copy.articles.back}
      </Link>
      <h1>{article.title}</h1>
      {article.authorName && (
        <p style={{ color: "var(--hub-muted)" }}>
          {copy.articles.by} {article.authorName}
        </p>
      )}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" style={{ width: "100%", borderRadius: "0.75rem", objectFit: "cover" }} />
      )}
      {article.bodyHtml && <div dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />}
    </article>
  );
}
