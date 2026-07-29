import type { SVGProps } from "react";

const brandMarkSizes = { sm: 32, md: 48, lg: 64 } as const;

export type BrandMarkSize = keyof typeof brandMarkSizes;

// BrandMark is the sized convenience wrapper around HubBrandMark used by the
// web error/fallback pages (e.g. `<BrandMark size="lg" />`).
export function BrandMark({
  size = "md",
  ...props
}: Omit<SVGProps<SVGSVGElement>, "size"> & { size?: BrandMarkSize }) {
  const px = brandMarkSizes[size] ?? brandMarkSizes.md;
  return <HubBrandMark width={px} height={px} {...props} />;
}

// Institutional shield mark — an open-book / scale-of-justice motif in the
// UDP Derecho red/charcoal palette (not a reuse of Gremia's mascot artwork).
export function HubBrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 180 180" fill="none" role="img" aria-label="Hub Negocios UDP" {...props}>
      <rect width="180" height="180" rx="28" fill="#27282F" />
      <path d="M90 38 34 60v10c0 4 3 7 7 7h98c4 0 7-3 7-7V60L90 38Z" fill="#E2383F" />
      <rect x="50" y="82" width="14" height="52" rx="3" fill="#F2E3E3" />
      <rect x="83" y="82" width="14" height="52" rx="3" fill="#F2E3E3" />
      <rect x="116" y="82" width="14" height="52" rx="3" fill="#F2E3E3" />
      <rect x="40" y="140" width="100" height="10" rx="3" fill="#E2383F" />
      <circle cx="90" cy="58" r="7" fill="#27282F" />
    </svg>
  );
}
