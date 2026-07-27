import Link from "next/link";
import type { Clinic } from "@hubnegocios/api-client";
import { HubCard } from "@hubnegocios/ui";
import { api } from "@/lib/api";
import type { WebPageCopy } from "@/lib/copy";

export function ClinicCard({ clinic, copy }: { clinic: Clinic; copy: WebPageCopy }) {
  const image = clinic.imageUrl ? api.storageUrl(clinic.imageUrl) : "";
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
      <h3 style={{ color: clinic.colorPrimary || undefined }}>{clinic.name}</h3>
      <p style={{ color: "var(--hub-muted)" }}>{clinic.shortDescription}</p>
      <Link href={`/clinicas/${clinic.slug}`} className="hub-button hub-button--outline hub-button--sm" style={{ marginTop: "0.75rem", display: "inline-flex" }}>
        {copy.home.viewClinic}
      </Link>
    </HubCard>
  );
}
