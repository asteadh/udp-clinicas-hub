"use client";

import type { TeamMember } from "@hubnegocios/api-client";
import { HubButton, HubField, HubRichTextEditor, HubSwitch } from "@hubnegocios/ui";
import { useRef, useState } from "react";
import { FormDialog, FormRow } from "@/components/form-dialog";
import { api } from "@/lib/api";
import type { AdminPageCopy } from "./shared";

export function TeamDialog({
  member,
  clinicSlug,
  token,
  createTeamMember,
  updateTeamMember,
  onClose,
  onSaved,
  copy,
}: {
  member: TeamMember | null;
  clinicSlug: string;
  token: string;
  createTeamMember: (body: Record<string, unknown>) => Promise<unknown>;
  updateTeamMember: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onSaved: () => void;
  copy: AdminPageCopy;
}) {
  const [fullName, setFullName] = useState(member?.fullName ?? "");
  const [roleTitle, setRoleTitle] = useState(member?.roleTitle ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [bioHtml, setBioHtml] = useState(member?.bioHtml ?? "");
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl ?? "");
  const [isPublished, setIsPublished] = useState(member?.isPublished ?? false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadPhoto(file: File) {
    setUploadError("");
    setUploading(true);
    try {
      const extension = file.name.split(".").pop() || "jpg";
      const safeName = (fullName || "team").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
      const renamed = new File([file], `${safeName}-${Date.now()}.${extension}`, { type: file.type });
      const uploaded = await api.uploadFile(renamed, "team", token);
      setPhotoUrl(uploaded.path);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (member) {
      await updateTeamMember(member.id, { fullName, roleTitle, email, bioHtml, photoUrl, isPublished });
    } else {
      await createTeamMember({ clinicSlug, fullName, roleTitle, email, bioHtml, photoUrl });
    }
  }

  const preview = photoUrl ? api.storageUrl(photoUrl) : "";

  return (
    <FormDialog
      open
      title={member ? copy.teamPanel.editMember : copy.teamPanel.newMember}
      onClose={onClose}
      onSubmit={submit}
      onSaved={onSaved}
      submitLabel={member ? copy.common.save : copy.common.create}
      cancelLabel={copy.common.cancel}
      busyLabel={copy.common.saving}
      submitDisabled={uploading || !fullName.trim()}
      size="lg"
    >
      <FormRow>
        <HubField label={copy.teamPanel.fullName} value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        <HubField label={copy.teamPanel.roleTitle} value={roleTitle} onChange={(event) => setRoleTitle(event.target.value)} />
      </FormRow>
      <HubField label={copy.teamPanel.email} type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <div className="grid gap-1">
        <span className="text-sm font-semibold text-hub-muted">{copy.teamPanel.bio}</span>
        <HubRichTextEditor value={bioHtml} onChange={setBioHtml} />
      </div>
      <div className="grid gap-2">
        <HubField
          label={copy.teamPanel.photo}
          value={photoUrl}
          onChange={(event) => setPhotoUrl(event.target.value)}
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
              if (file) uploadPhoto(file);
              event.target.value = "";
            }}
          />
          <HubButton type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? copy.common.uploading : copy.common.upload}
          </HubButton>
        </div>
      </div>
      {member && (
        <label className="hub-actions">
          <HubSwitch checked={isPublished} onChange={setIsPublished} label={copy.common.publish} />
          <span>{isPublished ? copy.common.published : copy.common.draft}</span>
        </label>
      )}
    </FormDialog>
  );
}
