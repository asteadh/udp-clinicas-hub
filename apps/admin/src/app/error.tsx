"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BrandMark } from "@hubnegocios/ui";
import { adminPageCopy } from "@/lib/copy";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = adminPageCopy.errorPages;

  useEffect(() => {
    console.error("Admin app error:", error);
  }, [error]);

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
          <h1 className="text-7xl font-bold mb-2" style={{ color: "var(--hub-coral)" }}>
            500
          </h1>
          <div className="h-1 w-16 mx-auto rounded-full" style={{ background: "var(--hub-coral)" }} />
        </div>

        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold" style={{ color: "var(--hub-ink)" }}>{copy.errorTitle}</h2>
          <p style={{ color: "var(--hub-muted)" }} className="text-base leading-relaxed">
            {copy.errorBody}
          </p>
          {error.digest && (
            <p style={{ color: "var(--hub-muted)" }} className="text-xs font-mono mt-4">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="mb-8">
          <div
            className="inline-block rounded-full p-6 mb-4"
            style={{ background: "rgba(192, 57, 43, 0.1)" }}
          >
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: "var(--hub-coral)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            style={{
              background: "var(--hub-blue)",
              color: "#ffffff",
            }}
          >{copy.retry}</button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 border"
            style={{
              borderColor: "var(--hub-border)",
              color: "var(--hub-ink)",
              background: "var(--hub-surface)",
            }}
          >{copy.backToPanel}</Link>
        </div>

        <p className="mt-8 text-sm" style={{ color: "var(--hub-muted)" }}>
          {copy.persistHelp}
        </p>
      </div>
    </div>
  );
}
