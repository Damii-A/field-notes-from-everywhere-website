import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Stratosphere } from "@/components/Stratosphere";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { getHomeShowcase } from "@/lib/content";
import styles from "./Home.module.css";

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
                sizes="(max-width: 768px) 100vw, 340px"
                style={{ objectFit: "contain" }}
                priority
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
            color: "var(--ink-500)",
            margin: 0,
            maxWidth: "30ch",
            textWrap: "pretty",
          }}
        >
          Your next favorite book is just a few clicks away.
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: "76ch",
            width: "100%",
            textAlign: "justify",
            background: "var(--surface-well)",
            borderRadius: "var(--radius-2xl)",
            boxShadow: "var(--shadow-card)",
            padding: "clamp(24px,3.4vw,44px)",
          }}
        >
          <p style={{ font: "var(--type-body)", fontSize: "clamp(18px,1.6vw,22px)", color: "var(--ink-500)", margin: 0 }}>
            Somewhere out there is a book you&rsquo;re going to absolutely love. We&rsquo;d like to help you find it.
          </p>
          <p style={{ font: "var(--type-body)", fontSize: "clamp(18px,1.6vw,22px)", color: "var(--ink-500)", margin: 0 }}>
            The good news is, someone out there has probably already read, loved, and recommended it. So, our job is
            to make sure those recommendations find their way to you.
          </p>
          <p style={{ font: "var(--type-body)", fontSize: "clamp(18px,1.6vw,22px)", color: "var(--ink-500)", margin: 0 }}>
            Here at Field Notes From Everywhere, we spend our time digging through and analysing real reader
            discussions.
          </p>
          <div
            style={{
              font: "var(--type-body)",
              fontSize: "clamp(18px,1.6vw,22px)",
              fontStyle: "italic",
              color: "var(--ink-500)",
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
          <p style={{ font: "var(--type-body)", fontSize: "clamp(18px,1.6vw,22px)", color: "var(--ink-500)", margin: 0 }}>
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

      {/* What to Read When rail */}
      {showcase.when.length > 0 ? (
        <section style={{ background: "var(--oat-200)", padding: "clamp(32px,4vw,56px) 0 clamp(20px,2.4vw,32px)", overflow: "hidden" }}>
          <div className={styles.showcaseHeader} style={{ flexDirection: "row-reverse" }}>
            <Link
              href="/what-to-read-when"
              style={{
                display: "block",
                font: "var(--weight-bold) clamp(28px,3.2vw,38px)/1.02 var(--font-display)",
                letterSpacing: "var(--tracking-tight)",
                color: "var(--clay-700)",
                margin: 0,
                maxWidth: "24ch",
                textAlign: "right",
              }}
            >
              What to Read When
            </Link>
            <p style={{ font: "var(--type-body)", lineHeight: 1.7, color: "var(--ink-500)", margin: 0, maxWidth: "38ch" }}>
              For the moments when you know exactly how you want a book to make you feel, and nothing else will do.
            </p>
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

      {/* The Shortlist rail */}
      {showcase.shortlist.length > 0 ? (
        <section style={{ background: "var(--sage-100)", padding: "clamp(32px,4vw,56px) 0 clamp(20px,2.4vw,32px)", overflow: "hidden" }}>
          <div className={styles.showcaseHeader}>
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
            <p style={{ font: "var(--type-body)", lineHeight: 1.7, color: "var(--ink-500)", margin: 0, maxWidth: "56ch" }}>
              The books that rose to the top of the reader recommendations we analysed. One researched interest, the
              titles readers kept putting forward.
            </p>
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

      {/* Book Club Book Picks rail */}
      {showcase.clubPairs.length > 0 ? (
        <section style={{ background: "var(--paper-100)", padding: "clamp(32px,4vw,56px) 0 clamp(20px,2.4vw,32px)", overflow: "hidden" }}>
          <div className={styles.showcaseHeader}>
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
            <p style={{ font: "var(--type-body)", color: "var(--ink-500)", margin: 0, maxWidth: "42ch" }}>
              Books chosen for the group read: the ones worth bringing to a room full of opinions.
            </p>
          </div>
          <div className={styles.rail} style={{ gap: "clamp(36px,5vw,80px)", padding: "clamp(36px,5vw,64px) var(--gutter-screen) 60px", alignItems: "center" }}>
            {showcase.clubPairs.map(([a, b], i) => (
              <div key={a.slug} style={{ flex: "0 0 auto", display: "flex", alignItems: "center" }}>
                <Link
                  href={`/${a.category}/${a.slug}`}
                  style={{
                    width: 200,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    transform: "rotate(-1.6deg)",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-raised)" }}>
                    <ImagePlaceholder label="Article image" src={a.heroImage?.url} position={a.heroImage?.position} alt={a.heroImage?.alt} />
                  </div>
                  <span className={styles.railCardTitle} style={{ fontSize: "clamp(13px,1.3vw,15px)", lineHeight: 1.32 }}>
                    {a.title}
                  </span>
                </Link>
                <span
                  aria-hidden="true"
                  style={{ width: "clamp(18px,3vw,40px)", height: 1, background: "var(--border-strong)", flex: "0 0 auto", alignSelf: "center", marginTop: -40 }}
                />
                <Link
                  href={`/${b.category}/${b.slug}`}
                  style={{
                    width: 200,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    transform: `rotate(1.4deg) translateY(${i === 0 ? 34 : 34}px)`,
                  }}
                >
                  <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
                    <ImagePlaceholder label="Article image" src={b.heroImage?.url} position={b.heroImage?.position} alt={b.heroImage?.alt} />
                  </div>
                  <span className={styles.railCardTitle} style={{ fontSize: "clamp(13px,1.3vw,15px)", lineHeight: 1.32 }}>
                    {b.title}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section
        style={{
          background: "var(--sage-700)",
          padding: "clamp(48px,6vw,80px) var(--gutter-screen)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
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
            font: "var(--weight-bold) clamp(28px,3.4vw,44px)/1.1 var(--font-display)",
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
            <span style={{ font: "var(--weight-regular) clamp(17px,1.7vw,21px)/1.2 var(--font-display)", letterSpacing: "var(--tracking-normal)" }}>
              by Field Notes From Everywhere
            </span>
          </Link>
          <p style={{ font: "var(--type-body)", fontSize: "clamp(17px,1.7vw,21px)", lineHeight: 1.6, color: "var(--ink-700)", margin: 0, maxWidth: "62ch", textWrap: "balance" }}>
            Curated book recommendations, right in your inbox.{" "}
            <span style={{ fontWeight: "var(--weight-bold)", fontSize: "1.18em" }}>Every. Single. Day.</span>
          </p>
        </div>

        <div
          style={{
            maxWidth: "var(--max-content)",
            margin: "clamp(20px,2.4vw,32px) auto 0",
            padding: "0 var(--gutter-screen)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "clamp(32px,4.5vw,64px)",
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", alignSelf: "center", order: 2 }}>
            <div style={{ width: "100%", maxWidth: 360, background: "var(--surface-card)", borderRadius: "var(--radius-2xl)", padding: "clamp(16px,2vw,24px)", boxShadow: "var(--shadow-raised)" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <ImagePlaceholder label="Screenshot of a Reading Room catalogue email" />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(24px,3vw,36px)", textAlign: "left" }}>
            {[
              { label: "What you get", body: "Reading Room subscribers get a themed daily newsletter sharing the most-recommended books for one specific interest." },
              { label: "The themes", body: "Think “found family”, “female rage”, “emotionally devastating”, you name it. We’re basically working our way through as many reader interests as we can." },
              { label: "The research", body: "And of course, in true FNFE spirit, we’re not just cobbling together a list of five random recommendations. Every catalogue has at least 30 books and draws on hundreds of real reader recommendations." },
              { label: "Sunday catch-up", body: "Oh and don’t worry about having to keep up all the time. On Sundays we round up the week’s catalogues so you can catch up on anything you missed." },
            ].map((block) => (
              <div key={block.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ font: "var(--weight-semibold) var(--text-sm)/1.2 var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-700)", margin: 0 }}>
                  {block.label}
                </p>
                <p style={{ font: "var(--type-body)", fontSize: "clamp(17px,1.5vw,19px)", lineHeight: 1.62, color: "var(--ink-700)", margin: 0, textWrap: "pretty" }}>{block.body}</p>
              </div>
            ))}
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
                color: "var(--ink-500)",
                margin: 0,
                maxWidth: "26ch",
                textWrap: "pretty",
              }}
            >
              Sound like your kind of thing? Your first 7 days are on us.
            </h3>
            <p style={{ font: "var(--type-body)", color: "var(--ink-500)", margin: 0, maxWidth: "54ch" }}>
              You&rsquo;ll get full access to The Reading Room completely free for 7 days, no credit card required.
              And if you decide to stick around, it&rsquo;s just $7/month after that. Cancel anytime.
            </p>
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
