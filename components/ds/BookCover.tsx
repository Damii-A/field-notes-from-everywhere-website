import Image from "next/image";

const SPINES = ["var(--slate-600)", "var(--clay-600)", "var(--sky-600)", "var(--sage-600)", "var(--ochre-500)"];

export interface BookCoverProps {
  title: string;
  author?: string;
  src?: string;
  alt?: string;
  spine?: string;
  width?: number;
  ratio?: number;
  bookmark?: boolean;
  style?: React.CSSProperties;
}

/** Ported from the design system's `components/discovery/BookCover.jsx`. */
export function BookCover({
  title,
  author,
  src,
  alt,
  spine,
  width = 132,
  ratio = 1.5,
  bookmark = true,
  style,
}: BookCoverProps) {
  const hue = spine || SPINES[(title || "").length % SPINES.length];
  const height = Math.round(width * ratio);

  return (
    <div style={{ position: "relative", width, height, flex: "0 0 auto", ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "var(--radius-cover)",
          background: src ? undefined : hue,
          boxShadow: "var(--shadow-cover)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: src ? 0 : "14px 12px",
        }}
      >
        {src ? (
          <Image src={src} alt={alt || title} fill sizes={`${width}px`} style={{ objectFit: "cover" }} />
        ) : (
          <>
            <span
              style={{
                font: "var(--weight-bold) var(--text-sm)/1.2 var(--font-display)",
                color: "rgba(245,247,238,.95)",
              }}
            >
              {title}
            </span>
            {author ? (
              <span
                style={{
                  font: "var(--weight-semibold) var(--text-2xs)/1.3 var(--font-mono)",
                  color: "rgba(245,247,238,.72)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--tracking-wide)",
                }}
              >
                {author}
              </span>
            ) : null}
            <span
              aria-hidden
              style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: "rgba(48,43,36,.22)" }}
            />
          </>
        )}
      </div>
      {bookmark ? (
        <span
          aria-hidden
          style={{
            position: "absolute",
            right: 14,
            bottom: -14,
            width: 18,
            height: 34,
            background: "var(--accent-mark)",
            clipPath: "polygon(0 0,100% 0,100% 100%,50% 76%,0 100%)",
            boxShadow: "0 3px 6px rgba(48,43,36,.18)",
          }}
        />
      ) : null}
    </div>
  );
}
