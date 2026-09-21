import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        style={{
          minHeight: "min(60vh, 640px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(64px,10vw,140px) var(--gutter-screen)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
          <h1
            style={{
              font: "var(--weight-bold) clamp(28px,4vw,44px)/1.1 var(--font-display)",
              color: "var(--ink-900)",
              margin: 0,
            }}
          >
            Page not found
          </h1>
          <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
            We couldn&rsquo;t find that page.
          </p>
          <Link
            href="/"
            style={{
              font: "var(--weight-bold) var(--text-base)/1 var(--font-display)",
              color: "var(--accent-primary)",
              textDecoration: "underline",
            }}
          >
            Back to the homepage
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
