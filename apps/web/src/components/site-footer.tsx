import type { WebPageCopy } from "@/lib/copy";

export function SiteFooter({ copy }: { copy: WebPageCopy }) {
  return (
    <footer className="site-footer">
      <div className="hub-page" style={{ padding: 0 }}>
        <p>{copy.footer.rights}</p>
      </div>
    </footer>
  );
}
