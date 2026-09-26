import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UnsubscribeConfirm } from "@/components/UnsubscribeConfirm";
import { getSiteSettings } from "@/lib/content";
import { isValidUnsubscribeToken } from "@/lib/unsubscribe";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

/**
 * Where an email's "Unsubscribe" link lands (lib/unsubscribe.ts). Not in the
 * design: an ordinary requirement of sending list email (DECISIONS.md,
 * 2026-09-26). Asks for a click rather than unsubscribing on load, because
 * mail filters open links to scan them. Laid out like /contact.
 */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ e?: string; t?: string }> }) {
  const { e = "", t = "" } = await searchParams;
  const valid = isValidUnsubscribeToken(e, t);
  const settings = valid ? null : await getSiteSettings();

  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "min(72vh, 760px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(64px, 10vw, 140px) var(--gutter-screen)",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 18,
          }}
        >
          {valid ? (
            <UnsubscribeConfirm email={e} token={t} />
          ) : (
            <>
              <h1
                style={{
                  font: "var(--weight-bold) clamp(28px,4.4vw,48px)/1.08 var(--font-display)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--clay-700)",
                  margin: 0,
                  textWrap: "pretty",
                }}
              >
                This link isn&rsquo;t working
              </h1>
              <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0, maxWidth: "44ch" }}>
                Please use the unsubscribe link at the bottom of one of our emails, or email{" "}
                <a href={`mailto:${settings!.contactEmail}`} style={{ color: "var(--text-link)" }}>
                  {settings!.contactEmail}
                </a>{" "}
                and we&rsquo;ll take you off the list.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
