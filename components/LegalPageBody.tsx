import { Header } from "./Header";
import { Footer } from "./Footer";
import type { LegalPage } from "@/lib/content";

/**
 * Shared skeleton for Terms / Privacy & Cookies / Disclosures — one template,
 * CMS-managed body per utility_pages.md §2. Real legal copy hasn't been
 * supplied yet (see CURRENT_STATE.md); `page.bodyHtml` currently comes from
 * `getLegalPage`'s placeholder text and will come from Sanity once real
 * copy exists there.
 */
export function LegalPageBody({ page }: { page: LegalPage }) {
  return (
    <>
      <Header />
      <main style={{ padding: "clamp(48px,7vw,96px) var(--gutter-screen) clamp(64px,8vw,112px)" }}>
        <div style={{ maxWidth: "68ch", margin: "0 auto" }}>
          <h1
            style={{
              font: "var(--weight-bold) clamp(28px,4.2vw,44px)/1.08 var(--font-display)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--ink-900)",
              margin: 0,
            }}
          >
            {page.title}
          </h1>
          <p
            style={{
              font: "var(--type-label)",
              letterSpacing: "var(--tracking-caps)",
              textTransform: "uppercase",
              color: "var(--ink-700)",
              margin: "18px 0 0",
            }}
          >
            Body content managed in the CMS
          </p>
          <div
            style={{
              marginTop: "clamp(28px,3.4vw,48px)",
              font: "var(--weight-regular) var(--text-md)/1.7 var(--font-body)",
              color: "var(--ink-700)",
            }}
            // Sanity's portable-text-to-HTML output for this field is trusted
            // editorial content, not user input — see ARCHITECTURE.md §6.
            dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
