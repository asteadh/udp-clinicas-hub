import type { Faq } from "@hubnegocios/api-client";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div>
      {faqs.map((faq) => (
        <details key={faq.id} className="faq-item">
          <summary>{faq.question}</summary>
          <div dangerouslySetInnerHTML={{ __html: faq.answerHtml }} />
        </details>
      ))}
    </div>
  );
}
