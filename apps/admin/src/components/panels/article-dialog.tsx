"use client";

import type { Article } from "@hubnegocios/api-client";
import { HubButton, HubField, HubRichTextEditor, HubTextarea } from "@hubnegocios/ui";
import { useRef, useState } from "react";
import { FormDialog, FormRow } from "@/components/form-dialog";
import { api } from "@/lib/api";
import type { AdminPageCopy } from "./shared";

export function ArticleDialog({
  article,
  clinicSlug,
  token,
  createArticle,
  updateArticle,
  onClose,
  onSaved,
  copy,
}: {
  article: Article | null;
  clinicSlug: string;
  token: string;
  createArticle: (body: Record<string, unknown>) => Promise<unknown>;
  updateArticle: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onSaved: () => void;
  copy: AdminPageCopy;
}) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [bodyHtml, setBodyHtml] = useState(article?.bodyHtml ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl ?? "");
  const [authorName, setAuthorName] = useState(article?.authorName ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadCover(file: File) {
    setUploadError("");
    setUploading(true);
    try {
      const extension = file.name.split(".").pop() || "jpg";
      const safeName = (slug || title || "article").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
      const renamed = new File([file], `${safeName}-${Date.now()}.${extension}`, { type: file.type });
      const uploaded = await api.uploadFile(renamed, "articles", token);
      setCoverImageUrl(uploaded.path);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (article) {
      await updateArticle(article.id, { title, slug, excerpt, bodyHtml, coverImageUrl, authorName });
    } else {
      await createArticle({ clinicSlug, title, slug, excerpt, bodyHtml, coverImageUrl, authorName });
    }
  }

  const preview = coverImageUrl ? api.storageUrl(coverImageUrl) : "";

  return (
    <FormDialog
      open
      title={article ? copy.articlesPanel.editArticle : copy.articlesPanel.newArticle}
      onClose={onClose}
      onSubmit={submit}
      onSaved={onSaved}
      submitLabel={article ? copy.common.save : copy.common.create}
      cancelLabel={copy.common.cancel}
      busyLabel={copy.common.saving}
      submitDisabled={uploading || !title.trim()}
      size="lg"
    >
      <FormRow>
        <HubField label={copy.articlesPanel.articleTitle} value={title} onChange={(event) => setTitle(event.target.value)} required />
        <HubField label={copy.articlesPanel.slug} value={slug} onChange={(event) => setSlug(event.target.value)} helper="Se genera automáticamente si se deja vacío" />
      </FormRow>
      <FormRow>
        <HubField label={copy.articlesPanel.author} value={authorName} onChange={(event) => setAuthorName(event.target.value)} />
      </FormRow>
      <label className="hub-field">
        <span>{copy.articlesPanel.excerpt}</span>
        <HubTextarea rows={2} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
      </label>
      <div className="grid gap-1">
        <span className="text-sm font-semibold text-hub-muted">{copy.articlesPanel.body}</span>
        <HubRichTextEditor value={bodyHtml} onChange={setBodyHtml} />
      </div>
      <div className="grid gap-2">
        <HubField
          label={copy.articlesPanel.coverImage}
          value={coverImageUrl}
          onChange={(event) => setCoverImageUrl(event.target.value)}
          error={uploadError || undefined}
        />
        <div className="flex items-center gap-3">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-12 rounded-lg border border-hub-border object-cover" />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadCover(file);
              event.target.value = "";
            }}
          />
          <HubButton type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? copy.common.uploading : copy.common.upload}
          </HubButton>
        </div>
      </div>
    </FormDialog>
  );
}
