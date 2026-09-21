"use client";

const CDN = "https://cdn.jsdelivr.net/npm/lucide-static/icons/";

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  title?: string;
  style?: React.CSSProperties;
}

/** Ported from the design system's `components/core/Icon.jsx`. */
export function Icon({ name, size = 20, color = "currentColor", title, style }: IconProps) {
  const url = `url("${CDN}${name}.svg")`;
  return (
    <span
      role="img"
      aria-label={title || name}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flex: "0 0 auto",
        backgroundColor: color,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        ...style,
      }}
    />
  );
}
