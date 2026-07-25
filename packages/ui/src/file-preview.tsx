"use client";

import { useMemo } from "react";
import { HubButton } from "./button";
import { HubDialog } from "./dialog";

type FileKind = "image" | "pdf" | "other";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp", "heic"];

function detectKind(url: string, mimeType?: string): FileKind {
  const mime = (mimeType ?? "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  // Fall back to the extension in the path (ignore query string / hash).
  const ext = url.split(/[?#]/)[0].split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "other";
}

const defaultLabels = {
  download: "Descargar",
  close: "Cerrar",
  openTab: "Abrir en pestaña nueva",
  noPreview: "No hay vista previa disponible para este archivo.",
};

/**
 * Full-width dialog that previews an attachment (image / PDF inline, other
 * types get a download prompt) and always offers a download action.
 * Presentational only — callers pass an already-resolved `url` (e.g. from
 * `api.storageUrl`).
 */
export function HubFilePreview({
  open,
  onClose,
  url,
  name,
  mimeType,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  url: string;
  name?: string;
  mimeType?: string;
  labels?: Partial<typeof defaultLabels>;
}) {
  const kind = useMemo(() => detectKind(url, mimeType), [url, mimeType]);
  const text = { ...defaultLabels, ...labels };
  const displayName = name || url.split(/[?#]/)[0].split("/").pop() || "archivo";

  return (
    <HubDialog open={open} onClose={onClose} size="lg" ariaLabel={displayName}>
      <div className="hub-file-preview">
        <div className="hub-file-preview__head">
          <FileGlyph aria-hidden />
          <p className="hub-file-preview__name" title={displayName}>
            {displayName}
          </p>
        </div>

        <div className="hub-file-preview__stage">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={displayName} />
          ) : kind === "pdf" ? (
            <iframe src={url} title={displayName} />
          ) : (
            <div className="hub-file-preview__fallback">
              <FileGlyph size={40} aria-hidden />
              <span>{text.noPreview}</span>
            </div>
          )}
        </div>

        <div className="hub-dialog__actions">
          <HubButton variant="ghost" type="button" onClick={onClose}>
            {text.close}
          </HubButton>
          <a
            className="hub-button hub-button--primary"
            href={url}
            download={displayName}
            target="_blank"
            rel="noreferrer"
          >
            <DownloadGlyph aria-hidden />
            {text.download}
          </a>
        </div>
      </div>
    </HubDialog>
  );
}

function FileGlyph({ size = 22 }: { size?: number; "aria-hidden"?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function DownloadGlyph({ size = 18 }: { size?: number; "aria-hidden"?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ marginRight: "0.4rem" }}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}
