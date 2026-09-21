import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

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
          <h1
            style={{
              font: "var(--weight-bold) clamp(28px,4.4vw,48px)/1.08 var(--font-display)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--clay-700)",
              margin: 0,
              textWrap: "pretty",
            }}
          >
            Want to get in touch?
          </h1>
          <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0, maxWidth: "40ch" }}>
            Have a question, suggestion, or just want to say hello? We&rsquo;d love to hear from you.
          </p>
          <a
            href={`mailto:${settings.contactEmail}`}
            style={{
              font: "var(--weight-bold) clamp(17px,2.2vw,25px)/1.2 var(--font-display)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--accent-primary)",
              textDecoration: "underline",
              textUnderlineOffset: 5,
              marginTop: 6,
            }}
          >
            {settings.contactEmail}
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
