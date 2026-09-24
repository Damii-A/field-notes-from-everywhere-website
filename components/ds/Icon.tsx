/**
 * Ported from the design system's `components/core/Icon.jsx`, which masks
 * Lucide icons fetched from cdn.jsdelivr.net at runtime. The few icons this
 * site uses are bundled inline instead (paths copied from lucide-static
 * 1.47.0, ISC licence): no request to another site, no cache-lifetime issue,
 * and they render with the page. Add an icon here by copying its <path>s from
 * https://lucide.dev. See DECISIONS.md, 2026-09-24.
 */
const PATHS: Record<string, string[]> = {
  link: [
    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71",
    "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  ],
  "message-circle": [
    "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
  ],
  pin: [
    "M12 17v5",
    "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
  ],
  x: ["M18 6 6 18", "m6 6 12 12"],
  menu: ["M4 5h16", "M4 12h16", "M4 19h16"],
};

export interface IconProps {
  name: keyof typeof PATHS | (string & {});
  size?: number;
  color?: string;
  title?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 20, color = "currentColor", title, style }: IconProps) {
  const paths = PATHS[name] ?? [];
  return (
    <svg
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: "0 0 auto", display: "inline-block", ...style }}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
