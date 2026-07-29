import Link from "next/link";
import type { Clinic } from "@hubnegocios/api-client";
import { HubBadge, HubCard } from "@hubnegocios/ui";
import { api } from "@/lib/api";
import { ClinicIcon } from "@/components/clinic-icon";
import type { WebPageCopy } from "@/lib/copy";

export function ClinicCard({ clinic, copy }: { clinic: Clinic; copy: WebPageCopy }) {
  const image = clinic.imageUrl ? api.storageUrl(clinic.imageUrl) : "";
  const color = clinic.colorPrimary || undefined;
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
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "9999px",
          display: "grid",
          placeItems: "center",
          marginBottom: "0.6rem",
          background: color ? `color-mix(in srgb, ${color} 18%, transparent)` : "var(--hub-blue-soft)",
        }}
      >
        <ClinicIcon icon={clinic.icon} size={22} color={color || "var(--hub-deep-blue)"} />
      </div>
      <h3 style={{ color }}>{clinic.name}</h3>
      <p style={{ color: "var(--hub-muted)" }}>{clinic.shortDescription}</p>
      <HubBadge style={{ marginTop: "0.6rem" }}>{copy.clinics.badgeFreeService}</HubBadge>
      <div>
        <Link
          href={`/clinicas/${clinic.slug}`}
          className="hub-button hub-button--outline hub-button--sm"
          style={{ marginTop: "0.75rem", display: "inline-flex" }}
        >
          {copy.home.viewClinic}
        </Link>
      </div>
    </HubCard>
  );
}
