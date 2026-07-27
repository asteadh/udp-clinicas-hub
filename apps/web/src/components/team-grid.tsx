import type { TeamMember } from "@hubnegocios/api-client";
import { HubCard } from "@hubnegocios/ui";
import { api } from "@/lib/api";

export function TeamGrid({ team }: { team: TeamMember[] }) {
  return (
    <div className="hub-grid">
      {team.map((member) => (
        <HubCard key={member.id}>
          {member.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={api.storageUrl(member.photoUrl)}
              alt=""
              style={{ width: "72px", height: "72px", borderRadius: "9999px", objectFit: "cover", marginBottom: "0.75rem" }}
            />
          )}
          <h3>{member.fullName}</h3>
          {member.roleTitle && <p style={{ color: "var(--hub-muted)" }}>{member.roleTitle}</p>}
        </HubCard>
      ))}
    </div>
  );
}
