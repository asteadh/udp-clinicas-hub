"use client";

import { useEffect } from "react";
import { BrandMark } from "@hubnegocios/ui";
import { webPageCopy } from "@/lib/copy";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = webPageCopy.errorPages;

  useEffect(() => {
    console.error("Global web error:", error);
  }, [error]);

  /* Esta pantalla se renderiza fuera de globals.css, así que es de los pocos
     sitios donde los colores van literales — por eso el validador de tokens la
     exime. La contrapartida es que no se actualizan solas: si cambia la paleta
     de packages/ui/src/tokens.ts, hay que replicarla aquí a mano. */
  return (
    <html>
      <head>
        <title>Error — Hub Negocios UDP</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          background: "linear-gradient(180deg, color-mix(in srgb, #F8F7F4 96%, transparent), color-mix(in srgb, #FFFFFF 90%, transparent)), #F8F7F4",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Hanken Grotesk", system-ui, -apple-system, sans-serif',
          color: "#1C1C1C",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "28rem",
            padding: "2rem",
          }}
        >
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "inline-block" }}>
              <BrandMark size="lg" />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h1
              style={{
                fontSize: "3rem",
                fontWeight: "bold",
                marginBottom: "0.5rem",
                color: "#C0392B",
              }}
            >
              500
            </h1>
            <div
              style={{
                height: "4px",
                width: "64px",
                margin: "0 auto",
                borderRadius: "9999px",
                background: "#C0392B",
              }}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                color: "#1C1C1C",
              }}
            >
              {copy.globalTitle}
            </h2>
            <p
              style={{
                color: "#6D6D6D",
                fontSize: "1rem",
                lineHeight: "1.7",
              }}
            >
              {copy.globalBody}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginTop: "2rem",
            }}
          >
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                fontWeight: "500",
                border: "none",
                cursor: "pointer",
                /* Tinta, no rojo: el rojo institucional va como trazo, nunca
                   como relleno de botón. */
                background: "#1C1C1C",
                color: "#F8F7F4",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {copy.reload}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
