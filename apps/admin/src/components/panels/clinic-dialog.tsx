"use client";

import type { Clinic } from "@hubnegocios/api-client";
import { HubButton, HubField, HubRichTextEditor, HubSwitch } from "@hubnegocios/ui";
import { useRef, useState } from "react";
import { FormDialog, FormRow } from "@/components/form-dialog";
import { api } from "@/lib/api";
import type { AdminPageCopy } from "./shared";

export function ClinicDialog({
  clinic,
  token,
  updateClinic,
  onClose,
  onSaved,
  copy,
}: {
  clinic: Clinic;
  token: string;
  updateClinic: (slug: string, body: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onSaved: () => void;
  copy: AdminPageCopy;
}) {
  const [name, setName] = useState(clinic.name);
  const [shortDescription, setShortDescription] = useState(clinic.shortDescription ?? "");
  const [descriptionHtml, setDescriptionHtml] = useState(clinic.descriptionHtml ?? "");
  const [icon, setIcon] = useState(clinic.icon ?? "");
  const [colorPrimary, setColorPrimary] = useState(clinic.colorPrimary ?? "");
  const [imageUrl, setImageUrl] = useState(clinic.imageUrl ?? "");
  const [contactEmail, setContactEmail] = useState(clinic.contactEmail ?? "");
  const [isActive, setIsActive] = useState(clinic.isActive !== false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File) {
    setUploadError("");
    setUploading(true);
    try {
      const extension = file.name.split(".").pop() || "jpg";
      const renamed = new File([file], `${clinic.slug}-${Date.now()}.${extension}`, { type: file.type });
      const uploaded = await api.uploadFile(renamed, "clinics", token);
      setImageUrl(uploaded.path);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    await updateClinic(clinic.slug, {
      name,
      shortDescription,
      descriptionHtml,
      icon,
      colorPrimary,
      imageUrl,
      contactEmail,
      isActive,
    });
  }

  const preview = imageUrl ? api.storageUrl(imageUrl) : "";

  return (
    <FormDialog
      open
      title={copy.clinicsPanel.editClinic}
      onClose={onClose}
      onSubmit={submit}
      onSaved={onSaved}
      submitLabel={copy.common.save}
      cancelLabel={copy.common.cancel}
      busyLabel={copy.common.saving}
      submitDisabled={uploading || !name.trim()}
      size="lg"
    >
      <FormRow>
        <HubField label={copy.clinicsPanel.name} value={name} onChange={(event) => setName(event.target.value)} required />
        <HubField label={copy.clinicsPanel.contactEmail} type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
      </FormRow>
      <HubField label={copy.clinicsPanel.shortDescription} value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} />
      <div className="grid gap-1">
        <span className="text-sm font-semibold text-hub-muted">{copy.clinicsPanel.description}</span>
        <HubRichTextEditor value={descriptionHtml} onChange={setDescriptionHtml} />
      </div>
      <FormRow>
        <HubField label={copy.clinicsPanel.icon} value={icon} onChange={(event) => setIcon(event.target.value)} />
        <HubField label={copy.clinicsPanel.colorPrimary} value={colorPrimary} onChange={(event) => setColorPrimary(event.target.value)} />
      </FormRow>
      <div className="grid gap-2">
        <HubField
          label={copy.clinicsPanel.image}
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
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
              if (file) uploadImage(file);
              event.target.value = "";
            }}
          />
          <HubButton type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? copy.common.uploading : copy.common.upload}
          </HubButton>
        </div>
      </div>
      <label className="hub-actions">
        <HubSwitch checked={isActive} onChange={setIsActive} label={copy.common.status} />
        <span>{isActive ? copy.common.active : copy.common.inactive}</span>
      </label>
    </FormDialog>
  );
}
