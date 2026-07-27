import Link from "next/link";
import type { Article } from "@hubnegocios/api-client";
import { HubCard } from "@hubnegocios/ui";
import { api } from "@/lib/api";
import type { WebPageCopy } from "@/lib/copy";

export function ArticleCard({ article, copy }: { article: Article; copy: WebPageCopy }) {
  const image = article.coverImageUrl ? api.storageUrl(article.coverImageUrl) : "";
  return (
    <HubCard>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: "0.75rem", marginBottom: "0.75rem" }}
        />
      )}
      <h3>{article.title}</h3>
      {article.excerpt && <p style={{ color: "var(--hub-muted)" }}>{article.excerpt}</p>}
      {article.authorName && (
        <p style={{ color: "var(--hub-muted)", fontSize: "0.85rem" }}>
          {copy.articles.by} {article.authorName}
        </p>
      )}
      <Link href={`/articulos/${article.slug}`} className="hub-button hub-button--link" style={{ marginTop: "0.5rem", display: "inline-flex" }}>
        {copy.articles.readMore}
      </Link>
    </HubCard>
  );
}
