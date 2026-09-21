"use client";

// `ssr: false` on next/dynamic is only allowed from a Client Component —
// hence this thin wrapper around the dynamic import, separate from the
// server-evaluated page.tsx. See page.tsx for why this indirection exists.
import dynamicImport from "next/dynamic";

const StudioClient = dynamicImport(() => import("./StudioClient"), { ssr: false });

export default function StudioLoader() {
  return <StudioClient />;
}
