import Image from "next/image";

export interface ImagePlaceholderProps {
  /** What this image is for — shown as the empty-state caption. Mirrors the
   * design's `<image-slot placeholder="...">` text so it's obvious in dev
   * which Sanity image field still needs a real photo. */
  label: string;
  src?: string;
  alt?: string;
  /** CSS object-position for the image (e.g. from a Sanity hotspot). */
  position?: string;
  style?: React.CSSProperties;
  fill?: boolean;
}

/**
 * Stands in for the design tool's `<image-slot>` authoring placeholder (see
 * ARCHITECTURE.md §7 — that element is a design-preview mechanism only). In
 * production this renders a real Sanity image via `next/image`; with no
 * image yet, it renders a neutral placeholder box labelled with what belongs
 * there, so every page stays visually complete before Sanity is populated.
 */
export function ImagePlaceholder({ label, src, alt, position, style, fill = true }: ImagePlaceholderProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt || label}
        fill={fill}
        sizes="(max-width: 768px) 100vw, 50vw"
        style={{ objectFit: "cover", objectPosition: position, ...style }}
      />
    );
  }
  return (
    <div
      style={{
        position: fill ? "absolute" : "relative",
        inset: fill ? 0 : undefined,
        width: fill ? undefined : "100%",
        height: fill ? undefined : "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 12,
        background: "rgba(127,127,127,.08)",
        color: "var(--text-faint)",
        font: "var(--type-small)",
        ...style,
      }}
    >
      {label}
    </div>
  );
}
