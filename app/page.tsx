import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Stratosphere } from "@/components/Stratosphere";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { getHomeShowcase } from "@/lib/content";
import styles from "./Home.module.css";

// The layout's canonical "./" resolves to "/index" on the root page, a duplicate
// address of the homepage; state "/" explicitly (keeps the layout's RSS link).
export const metadata: Metadata = {
  ...pageMetadata({ path: "/" }),
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default async function HomePage() {
  const showcase = await getHomeShowcase();

  return (
    <>
      <Header />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            <h1 className={styles.heroHeadline}>Your TBR list is about to get a lot longer</h1>
            <div className={styles.heroImageWrap}>
              <Image
                src="/images/homepage-hero-books.png"
                alt="A watercolour illustration of a stack of four books"
                fill
                sizes="315px" // measured 2026-09-27: never displays wider than ~315px at any viewport
                style={{ objectFit: "contain" }}
                priority
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      <Stratosphere />

      <section
        style={{
          padding: "clamp(32px,4vw,56px) var(--gutter-screen) clamp(36px,4.5vw,60px)",
          maxWidth: "var(--max-content)",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "clamp(24px,3.4vw,44px)",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            font: "var(--weight-bold) clamp(30px,3.4vw,44px)/1.1 var(--font-display)",
            letterSpacing: "var(--tracking-tight)",
            color: "var(--text-soft)",
            margin: 0,
            maxWidth: "30ch",
            textWrap: "pretty",
          }}
        >
          Your next favorite book is just a few clicks away.
        </h2>
        <div
          className={styles.introWell}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: "76ch",
            width: "100%",
            background: "var(--surface-well)",
            borderRadius: "var(--radius-2xl)",
            boxShadow: "var(--shadow-card)",
            padding: "clamp(24px,3.4vw,44px)",
          }}
        >
          <p style={{ font: "var(--type-body)", fontSize: "clamp(18px,1.6vw,22px)", color: "var(--text-soft)", margin: 0 }}>
            Somewhere out there is a book you&rsquo;re going to absolutely love.
          </p>
          <p style={{ font: "var(--type-body)", fontSize: "clamp(18px,1.6vw,22px)", color: "var(--text-soft)", margin: 0 }}>
            The good news is, someone out there has probably already read, loved, and recommended it. So, our job is
            to make sure those recommendations find their way to you.
          </p>
          <p style={{ font: "var(--type-body)", fontSize: "clamp(18px,1.6vw,22px)", color: "var(--text-soft)", margin: 0 }}>
            Here at Field Notes From Everywhere, we spend our time digging through and analysing real reader
            discussions.
          </p>
          <div
            style={{
              font: "var(--type-body)",
              fontSize: "clamp(18px,1.6vw,22px)",
              fontStyle: "italic",
              color: "var(--text-soft)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span>What are people looking for?</span>
            <span>What are other readers recommending?</span>
            <span>Which books keep coming up again and again?</span>
          </div>
          <p style={{ font: "var(--type-body)", fontSize: "clamp(18px,1.6vw,22px)", color: "var(--text-soft)", margin: 0 }}>
            Then, we take the top recommendations and share them with you!
          </p>
        </div>
      </section>

      <section style={{ background: "var(--clay-200)", padding: "clamp(32px,4vw,56px) var(--gutter-screen)" }}>
        <h3
          style={{
            textAlign: "center",
            font: "var(--weight-bold) clamp(28px,3.2vw,40px)/1.2 var(--font-display)",
            letterSpacing: "var(--tracking-display)",
            color: "var(--ink-700)",
            margin: 0,
          }}
        >
          Explore our columns
        </h3>
      </section>

      {/* The Shortlist rail */}
      {showcase.shortlist.length > 0 ? (
        <section style={{ background: "var(--sage-100)", padding: "clamp(32px,4vw,56px) 0 clamp(20px,2.4vw,32px)", overflow: "hidden" }}>
          <div className={styles.showcaseHeader}>
            <div className={styles.showcaseBox} style={{ ["--box-bg" as string]: "var(--sage-100)" }}>
              <Link
                href="/the-shortlist"
                style={{
                  display: "block",
                  font: "var(--weight-bold) clamp(28px,3.2vw,38px)/1.02 var(--font-display)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--sage-700)",
                }}
              >
                The Shortlist
              </Link>
              <p style={{ font: "var(--type-body)", lineHeight: 1.7, color: "var(--text-soft)", margin: 0, maxWidth: "70ch" }}>
                Our shortlists are ranked collections of books built around a specific theme, trope, or reader request.
                We analyse real reader discussions to uncover the books recommended most often, then distill those
                recommendations into ranked lists.
              </p>
            </div>
          </div>
          <div className={styles.rail} style={{ gap: "clamp(20px,2.4vw,32px)", padding: "clamp(36px,5vw,64px) var(--gutter-screen) 60px" }}>
            {showcase.shortlist.map((a) => (
              <Link key={a.slug} href={`/${a.category}/${a.slug}`} className={styles.railCard}>
                <div className={styles.railCardImage}>
                  <ImagePlaceholder label="Article image" src={a.heroImage?.url} position={a.heroImage?.position} alt={a.heroImage?.alt} />
                </div>
                <span className={styles.railCardTitle}>{a.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* What to Read When rail */}
      {showcase.when.length > 0 ? (
        <section style={{ background: "var(--oat-200)", padding: "clamp(32px,4vw,56px) 0 clamp(20px,2.4vw,32px)", overflow: "hidden" }}>
          <div className={styles.showcaseHeader}>
            <div className={styles.showcaseBox} style={{ ["--box-bg" as string]: "var(--oat-200)" }}>
              <Link
                href="/what-to-read-when"
                style={{
                  display: "block",
                  font: "var(--weight-bold) clamp(28px,3.2vw,38px)/1.02 var(--font-display)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--clay-700)",
                  margin: 0,
                  maxWidth: "24ch",
                }}
              >
                What to Read When
              </Link>
              <p style={{ font: "var(--type-body)", lineHeight: 1.7, color: "var(--text-soft)", margin: 0, maxWidth: "70ch" }}>
                This is where you&rsquo;ll find book lists for specific reading cravings. Whether you want something
                deliciously messy, genuinely terrifying, or simply impossible to put down, we probably have (or are
                currently working on) a list to match.
              </p>
            </div>
          </div>
          <div className={styles.rail} style={{ gap: "clamp(28px,4vw,64px)", padding: "clamp(36px,5vw,64px) var(--gutter-screen) 60px" }}>
            {showcase.when.map((a) => (
              <Link key={a.slug} href={`/${a.category}/${a.slug}`} className={styles.railCard}>
                <div className={styles.railCardImage}>
                  <ImagePlaceholder label="Article image" src={a.heroImage?.url} position={a.heroImage?.position} alt={a.heroImage?.alt} />
                </div>
                <span className={styles.railCardTitle}>{a.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Book Club Book Picks rail */}
      {showcase.clubPairs.length > 0 ? (
        <section style={{ background: "var(--paper-100)", padding: "clamp(32px,4vw,56px) 0 clamp(20px,2.4vw,32px)", overflow: "hidden" }}>
          <div className={styles.showcaseHeader}>
            <div className={styles.showcaseBox} style={{ ["--box-bg" as string]: "var(--paper-100)" }}>
              <Link
                href="/book-club-book-picks"
                style={{
                  display: "block",
                  font: "var(--weight-bold) clamp(26px,3vw,38px)/1.04 var(--font-display)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--slate-600)",
                  maxWidth: "24ch",
                }}
              >
                Book Club Book Picks
              </Link>
              <p style={{ font: "var(--type-body)", color: "var(--text-soft)", margin: 0, maxWidth: "70ch" }}>
                This is the column for readers looking for book recommendations for shared reading experiences. These
                book lists are built from our analysis of real reader recommendations for the specific experience
                we&rsquo;re curating for.
              </p>
            </div>
          </div>
          <div className={styles.rail} style={{ gap: "clamp(36px,5vw,80px)", padding: "clamp(36px,5vw,64px) var(--gutter-screen) 60px", alignItems: "center" }}>
            {showcase.clubPairs.map(([a, b], i) => (
              <div key={a.slug} style={{ flex: "0 0 auto", display: "flex", alignItems: "center" }}>
                <Link
                  href={`/${a.category}/${a.slug}`}
                  style={{
                    width: 260,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    transform: "rotate(-1.6deg)",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-raised)" }}>
                    <ImagePlaceholder label="Article image" src={a.heroImage?.url} position={a.heroImage?.position} alt={a.heroImage?.alt} />
                  </div>
                  <span className={styles.railCardTitle} style={{ fontSize: "clamp(13px,1.3vw,15px)", lineHeight: 1.32 }}>
                    {a.title}
                  </span>
                </Link>
                {/* An odd one out (no partner yet) sits alone, without the connecting line. */}
                {b ? (
                  <>
                    <span
                      aria-hidden="true"
                      style={{ width: "clamp(18px,3vw,40px)", height: 1, background: "var(--border-strong)", flex: "0 0 auto", alignSelf: "center", marginTop: -40 }}
                    />
                    <Link
                      href={`/${b.category}/${b.slug}`}
                      style={{
                        width: 260,
                        display: "flex",
                        flexDirection: "column",
                        gap: 14,
                        transform: `rotate(1.4deg) translateY(${i === 0 ? 34 : 34}px)`,
                      }}
                    >
                      <div style={{ position: "relative", width: "100%", aspectRatio: "3/2", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
                        <ImagePlaceholder label="Article image" src={b.heroImage?.url} position={b.heroImage?.position} alt={b.heroImage?.alt} />
                      </div>
                      <span className={styles.railCardTitle} style={{ fontSize: "clamp(13px,1.3vw,15px)", lineHeight: 1.32 }}>
                        {b.title}
                      </span>
                    </Link>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section
        style={{
          background: "var(--sage-700)",
          // A slim transitional strip into The Reading Room, not a full section (user, 2026-09-27).
          padding: "clamp(24px,3vw,40px) var(--gutter-screen)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h2
          style={{
            font: "var(--weight-bold) clamp(22px,2.4vw,30px)/1.12 var(--font-display)",
            letterSpacing: "var(--tracking-tight)",
            color: "var(--paper-050)",
            margin: 0,
            maxWidth: "34ch",
            textWrap: "pretty",
          }}
        >
          And if your TBR can handle even more...
        </h2>
        <p style={{ font: "var(--type-quote)", color: "var(--paper-050)", margin: 0, maxWidth: "58ch" }}>
          We&rsquo;ll bring all the top recommendations straight to you. Again, and again, and again.
        </p>
        <p
          style={{
            font: "var(--weight-bold) clamp(23px,2.6vw,34px)/1.1 var(--font-display)",
            letterSpacing: "var(--tracking-tight)",
            color: "var(--ochre-100)",
            margin: 0,
            maxWidth: "58ch",
          }}
        >
          Introducing...
        </p>
      </section>

      <section style={{ background: "var(--clay-200)", padding: "clamp(32px,4vw,56px) 0 clamp(64px,8vw,110px)" }}>
        <div
          style={{
            maxWidth: "var(--max-content)",
            margin: "0 auto",
            padding: "0 var(--gutter-screen)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 14,
          }}
        >
          <Link
            href="/the-reading-room"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              font: "var(--weight-bold) clamp(28px,3.4vw,44px)/1.1 var(--font-display)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--clay-700)",
              maxWidth: "26ch",
              textWrap: "pretty",
            }}
          >
            <span>The Reading Room</span>
            <span style={{ font: "var(--weight-regular) clamp(17px,1.7vw,21px)/1.2 var(--font-display)", letterSpacing: "var(--tracking-normal)", color: "var(--clay-text)" }}>
              by Field Notes From Everywhere
            </span>
          </Link>
          <p style={{ font: "var(--type-body)", fontSize: "clamp(17px,1.7vw,21px)", lineHeight: 1.6, color: "var(--ink-700)", margin: 0, maxWidth: "62ch", textWrap: "balance" }}>
            Curated book recommendations, right in your inbox.
          </p>
        </div>

        <div
          className={styles.rrTeaser}
          style={{
            maxWidth: "var(--max-content)",
            margin: "clamp(20px,2.4vw,32px) auto 0",
            padding: "0 var(--gutter-screen)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", alignSelf: "center", order: 2 }}>
            <div style={{ width: "100%", maxWidth: 280, background: "var(--surface-card)", borderRadius: "var(--radius-2xl)", padding: "clamp(16px,2vw,24px)", boxShadow: "var(--shadow-raised)" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <ImagePlaceholder label="Screenshot of a Reading Room catalogue email" />
              </div>
            </div>
          </div>
          {/* Short teaser here, the full pitch on /the-reading-room: swapped with the landing page by the user, 2026-09-27 (DECISIONS.md). */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, textAlign: "left", alignSelf: "start" }}>
            <p style={{ font: "var(--type-body)", fontSize: "clamp(17px,1.5vw,19px)", lineHeight: 1.62, color: "var(--ink-700)", margin: 0, textWrap: "pretty" }}>
              Every Tuesday, Thursday and Saturday, we send out a catalogue of themed book recommendations.
            </p>
            <p style={{ font: "var(--type-body)", fontSize: "clamp(17px,1.5vw,19px)", lineHeight: 1.62, color: "var(--ink-700)", margin: 0, textWrap: "pretty" }}>
              The books in these catalogues are sourced from hundreds of reader recommendations, which are analyzed to
              uncover the top picks by real readers.
            </p>
            <p style={{ font: "var(--type-body)", fontSize: "clamp(17px,1.5vw,19px)", lineHeight: 1.62, color: "var(--ink-700)", margin: 0, textWrap: "pretty" }}>
              Oh and it&rsquo;s just $7/month.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: "var(--max-content)", margin: "clamp(64px,8vw,112px) auto 0", padding: "0 var(--gutter-screen)" }}>
          <div
            style={{
              background: "var(--sage-100)",
              borderRadius: "var(--radius-2xl)",
              padding: "clamp(36px,5vw,64px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
              textAlign: "center",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3
              style={{
                font: "var(--weight-bold) clamp(23px,2.9vw,34px)/1.12 var(--font-display)",
                letterSpacing: "var(--tracking-tight)",
                color: "var(--text-soft)",
                margin: 0,
                maxWidth: "26ch",
                textWrap: "pretty",
              }}
            >
              Sound like your kind of thing?
            </h3>
            <Link
              href="/the-reading-room"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: 54,
                padding: "0 34px",
                marginTop: 8,
                borderRadius: "var(--radius-pill)",
                background: "var(--accent-primary)",
                color: "var(--text-inverse)",
                font: "var(--weight-bold) var(--text-md)/1 var(--font-display)",
                letterSpacing: "var(--tracking-display)",
                boxShadow: "var(--shadow-pill-primary)",
              }}
            >
              Take a look
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
