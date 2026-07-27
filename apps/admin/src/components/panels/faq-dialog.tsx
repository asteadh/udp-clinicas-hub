"use client";

import type { Faq } from "@hubnegocios/api-client";
import { HubField, HubRichTextEditor, HubSwitch } from "@hubnegocios/ui";
import { useState } from "react";
import { FormDialog } from "@/components/form-dialog";
import type { AdminPageCopy } from "./shared";

export function FaqDialog({
  faq,
  clinicSlug,
  createFaq,
  updateFaq,
  onClose,
  onSaved,
  copy,
}: {
  faq: Faq | null;
  clinicSlug: string;
  createFaq: (body: Record<string, unknown>) => Promise<unknown>;
  updateFaq: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onSaved: () => void;
  copy: AdminPageCopy;
}) {
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answerHtml, setAnswerHtml] = useState(faq?.answerHtml ?? "");
  const [isPublished, setIsPublished] = useState(faq?.isPublished ?? false);

  async function submit() {
    if (faq) {
      await updateFaq(faq.id, { question, answerHtml, isPublished });
    } else {
      await createFaq({ clinicSlug, question, answerHtml });
    }
  }

  return (
    <FormDialog
      open
      title={faq ? copy.faqsPanel.editFaq : copy.faqsPanel.newFaq}
      onClose={onClose}
      onSubmit={submit}
      onSaved={onSaved}
      submitLabel={copy.common.save}
      cancelLabel={copy.common.cancel}
      busyLabel={copy.common.saving}
      submitDisabled={!question.trim()}
      size="lg"
    >
      <HubField label={copy.faqsPanel.question} value={question} onChange={(event) => setQuestion(event.target.value)} required />
      <div className="grid gap-1">
        <span className="text-sm font-semibold text-hub-muted">{copy.faqsPanel.answer}</span>
        <HubRichTextEditor value={answerHtml} onChange={setAnswerHtml} />
      </div>
      {faq && (
        <label className="hub-actions">
          <HubSwitch checked={isPublished} onChange={setIsPublished} label={copy.common.publish} />
          <span>{isPublished ? copy.common.published : copy.common.draft}</span>
        </label>
      )}
    </FormDialog>
  );
}
