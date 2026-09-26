"use client";

import { OPEN_COOKIE_SETTINGS_EVENT } from "@/lib/consent";

/** Footer "Cookie settings": reopens the consent banner (components/ConsentManager.tsx) so anyone can change their choice. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
      style={{ background: "none", border: 0, paddingInline: 0, cursor: "pointer", textAlign: "left" }}
    >
      Cookie settings
    </button>
  );
}
