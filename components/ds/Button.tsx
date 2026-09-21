"use client";

import { useState } from "react";
import { Icon } from "./Icon";

type Tone = "primary" | "secondary" | "quiet" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const TONES: Record<Tone, { bg: string; fg: string; shadow: string; border: string }> = {
  primary: { bg: "var(--accent-primary)", fg: "var(--text-inverse)", shadow: "var(--shadow-pill-primary)", border: "transparent" },
  secondary: { bg: "var(--accent-secondary)", fg: "var(--text-inverse)", shadow: "var(--shadow-pill-secondary)", border: "transparent" },
  quiet: { bg: "var(--surface-card)", fg: "var(--text-body)", shadow: "var(--shadow-card)", border: "transparent" },
  outline: { bg: "transparent", fg: "var(--text-body)", shadow: "none", border: "var(--border-hairline)" },
  ghost: { bg: "transparent", fg: "var(--text-muted)", shadow: "none", border: "transparent" },
};

const SIZES: Record<Size, { h: number; px: number; font: string; icon: number }> = {
  sm: { h: 32, px: 14, font: "var(--text-sm)", icon: 16 },
  md: { h: 44, px: 22, font: "var(--text-base)", icon: 20 },
  lg: { h: 54, px: 30, font: "var(--text-md)", icon: 22 },
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  size?: Size;
  icon?: string;
  iconAfter?: string;
  fullWidth?: boolean;
}

/** Ported from the design system's `components/core/Button.jsx`. */
export function Button({
  children,
  tone = "primary",
  size = "md",
  icon,
  iconAfter,
  disabled = false,
  fullWidth = false,
  style,
  ...rest
}: ButtonProps) {
  const t = TONES[tone];
  const s = SIZES[size];
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPress(false);
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      {...rest}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        height: s.h,
        padding: `0 ${s.px}px`,
        width: fullWidth ? "100%" : undefined,
        font: `var(--weight-bold) ${s.font}/1 var(--font-display)`,
        color: t.fg,
        background: t.bg,
        border: t.border === "transparent" ? "none" : `1px solid ${t.border}`,
        borderRadius: "var(--radius-pill)",
        boxShadow: press ? "var(--shadow-flat)" : t.shadow,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        textDecoration: "none",
        whiteSpace: "nowrap",
        transform: disabled ? "none" : press ? "var(--press-scale)" : hover ? "var(--lift-hover)" : "none",
        filter: !disabled && hover && (tone === "primary" || tone === "secondary") ? "brightness(1.06)" : "none",
        transition:
          "transform var(--dur-fast) var(--ease-spring), box-shadow var(--dur-fast) var(--ease-soft), filter var(--dur-fast) var(--ease-soft)",
        ...style,
      }}
    >
      {icon ? <Icon name={icon} size={s.icon} /> : null}
      {children}
      {iconAfter ? <Icon name={iconAfter} size={s.icon} /> : null}
    </button>
  );
}
