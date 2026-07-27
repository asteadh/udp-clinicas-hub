import Link from "next/link";
import { BrandMark } from "@hubnegocios/ui";
import { webPageCopy } from "@/lib/copy";

export const metadata = {
  title: "404 — Hub Negocios UDP",
};

export default function NotFound() {
  const copy = webPageCopy.errorPages;
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: "linear-gradient(180deg, color-mix(in srgb, var(--hub-warm) 96%, transparent), color-mix(in srgb, var(--hub-surface) 90%, transparent)), var(--hub-warm)",
      }}
    >
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-block">
            <BrandMark size="lg" />
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-7xl font-bold mb-2" style={{ color: "var(--hub-deep-blue)" }}>
            404
          </h1>
          <div className="h-1 w-16 mx-auto rounded-full" style={{ background: "var(--hub-gold)" }} />
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold" style={{ color: "var(--hub-ink)" }}>
            {copy.notFoundTitle}
          </h2>
          <p style={{ color: "var(--hub-muted)" }} className="text-base leading-relaxed">
            {copy.notFoundBody}
          </p>
        </div>

        <div className="mb-8">
          <div
            className="inline-block rounded-full p-6 mb-4"
            style={{ background: "rgba(176, 141, 51, 0.1)" }}
          >
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--hub-gold)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4v2m0 6V7a5 5 0 015 5v5a5 5 0 01-5 5H7a5 5 0 01-5-5v-5a5 5 0 015-5h10z"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            style={{
              background: "var(--hub-blue)",
              color: "#ffffff",
            }}
          >{copy.goHome}</Link>
        </div>

        <p className="mt-8 text-xs" style={{ color: "var(--hub-muted)" }}>
          {copy.notFoundHelp}
        </p>
      </div>
    </div>
  );
}
