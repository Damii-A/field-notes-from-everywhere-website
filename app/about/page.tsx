import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "What Field Notes From Everywhere is, how we find the books we recommend, and who's behind it.",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Header />

      <section style={{ padding: "clamp(48px,7vw,104px) var(--gutter-screen) clamp(12px,1.6vw,24px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1
            style={{
              font: "var(--weight-bold) clamp(26px,3.6vw,40px)/1.08 var(--font-display)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--ink-900)",
              margin: 0,
              textAlign: "center",
              textWrap: "pretty",
            }}
          >
            About us
          </h1>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              marginTop: "clamp(24px,3vw,40px)",
              background: "var(--sage-100)",
              borderRadius: "var(--radius-2xl)",
              padding: "clamp(28px,3.4vw,44px) clamp(24px,4vw,48px)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <p style={{ font: "var(--weight-regular) clamp(17px,1.6vw,21px)/1.62 var(--font-body)", color: "var(--ink-800)", margin: 0 }}>
              We&rsquo;re a book discovery platform that analyses 100s of real reader discussions to find book
              recommendations and turn them into useful, carefully researched reading lists.
            </p>
            <p style={{ font: "var(--weight-regular) clamp(17px,1.6vw,21px)/1.62 var(--font-body)", color: "var(--ink-800)", margin: 0 }}>
              For every reader request, whether that&rsquo;s a character, relationship dynamic, setting, trope, mood,
              or reading experience, our job is to identify the books readers can&rsquo;t stop raving about and bring
              them to you.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(40px,5vw,72px) var(--gutter-screen)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h2
            style={{
              font: "var(--weight-bold) clamp(24px,3.4vw,38px)/1.12 var(--font-display)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--ink-900)",
              margin: 0,
              textAlign: "center",
              textWrap: "pretty",
            }}
          >
            But how exactly do we do this?
          </h2>
          <p style={{ font: "var(--type-quote)", color: "var(--clay-700)", margin: "20px auto 0", maxWidth: "44ch", textAlign: "center" }}>
            Currently, we have two mediums you can explore:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(24px,3vw,40px)", marginTop: "clamp(28px,3.4vw,48px)" }}>
            <div
              style={{
                background: "var(--surface-card)",
                borderRadius: "var(--radius-xl)",
                padding: "clamp(22px,2.6vw,36px)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span style={{ font: "var(--weight-bold) clamp(22px,2.6vw,30px)/1 var(--font-display)", color: "var(--clay-300)" }}>1</span>
                <h3
                  style={{
                    font: "var(--weight-bold) var(--text-lg)/1.25 var(--font-display)",
                    letterSpacing: "var(--tracking-tight)",
                    color: "var(--ink-900)",
                    margin: 0,
                  }}
                >
                  The FNFE Publication (aka the website you&rsquo;re on right now)
                </h3>
              </div>
              <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0, maxWidth: "66ch" }}>
                This is where you&rsquo;ll find articles where we share tailored reading lists around specific themes.
              </p>
              <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0, maxWidth: "66ch" }}>
                Right now, the publication is categorized into 3 columns:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))", gap: 18, marginTop: 4 }}>
                <div style={{ background: "var(--sage-100)", borderRadius: "var(--radius-lg)", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link href="/the-shortlist" style={{ font: "var(--weight-bold) var(--text-md)/1.25 var(--font-display)", letterSpacing: "var(--tracking-tight)", color: "var(--sage-700)" }}>
                    The Shortlist
                  </Link>
                  <p style={{ font: "var(--type-small)", color: "var(--ink-700)", margin: 0 }}>
                    This is a column where we share reading lists of the most recommended books for every reader theme
                    we cover.
                  </p>
                </div>
                <div style={{ background: "var(--oat-200)", borderRadius: "var(--radius-lg)", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link href="/what-to-read-when" style={{ font: "var(--weight-bold) var(--text-md)/1.25 var(--font-display)", letterSpacing: "var(--tracking-tight)", color: "var(--clay-700)" }}>
                    What To Read When
                  </Link>
                  <p style={{ font: "var(--type-small)", color: "var(--ink-700)", margin: 0 }}>
                    In this column, we share custom reading lists that match our book recommendations to specific
                    reader moments and requests.
                  </p>
                </div>
                <div style={{ background: "var(--sky-200)", borderRadius: "var(--radius-lg)", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                  <Link href="/book-club-book-picks" style={{ font: "var(--weight-bold) var(--text-md)/1.25 var(--font-display)", letterSpacing: "var(--tracking-tight)", color: "var(--sky-700)" }}>
                    Book Club Book Picks
                  </Link>
                  <p style={{ font: "var(--type-small)", color: "var(--ink-700)", margin: 0 }}>
                    This is our column where we build custom reading lists with book recommendations for various book
                    club types and themes.
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--slate-700)",
                borderRadius: "var(--radius-xl)",
                padding: "clamp(22px,2.6vw,36px)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span style={{ font: "var(--weight-bold) clamp(22px,2.6vw,30px)/1 var(--font-display)", color: "var(--ochre-500)" }}>2</span>
                <Link
                  href="/the-reading-room"
                  style={{ font: "var(--weight-bold) var(--text-lg)/1.25 var(--font-display)", letterSpacing: "var(--tracking-tight)", color: "var(--paper-050)" }}
                >
                  The Reading Room
                </Link>
              </div>
              <p style={{ font: "var(--type-body)", color: "var(--slate-100)", margin: 0, maxWidth: "66ch" }}>This is our paid offer.</p>
              <p style={{ font: "var(--type-body)", color: "var(--slate-100)", margin: 0, maxWidth: "66ch" }}>
                Every Monday through Saturday, we send members an email catalogue of 30+ book recommendations around a
                specific reader theme.
              </p>
              <p style={{ font: "var(--type-body)", color: "var(--slate-100)", margin: 0, maxWidth: "66ch" }}>This could be a genre, trope, mood, reader experience, etc.</p>
              <p style={{ font: "var(--type-body)", color: "var(--slate-100)", margin: 0, maxWidth: "66ch" }}>
                Then on Sundays we send a recap of all the themes we&rsquo;ve covered that week for members who need a
                refresher, roundup, or catch-up.
              </p>
              <div
                style={{
                  marginTop: 10,
                  background: "var(--paper-050)",
                  borderRadius: "var(--radius-lg)",
                  padding: "clamp(20px,2.4vw,28px)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: "44ch" }}>
                  <span style={{ font: "var(--type-label)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--clay-700)" }}>
                    The Reading Room by FNFE
                  </span>
                  <span
                    style={{
                      font: "var(--weight-bold) clamp(18px,2vw,23px)/1.16 var(--font-display)",
                      letterSpacing: "var(--tracking-tight)",
                      color: "var(--ink-900)",
                      textWrap: "pretty",
                    }}
                  >
                    Get 30+ book recommendations, delivered to your inbox six days a week.
                  </span>
                  <span style={{ font: "var(--type-small)", color: "var(--ink-700)" }}>{settings.readingRoomPriceCopy}</span>
                </div>
                <Link
                  href="/the-reading-room"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 44,
                    padding: "0 24px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--ochre-500)",
                    color: "var(--ink-900)",
                    font: "var(--weight-bold) var(--text-base)/1 var(--font-display)",
                    letterSpacing: "var(--tracking-display)",
                  }}
                >
                  Take a look
                </Link>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 760, margin: "clamp(32px,4vw,56px) auto 0" }}>
            <p
              style={{
                font: "var(--weight-regular) clamp(18px,1.9vw,24px)/1.5 var(--font-body)",
                color: "var(--ink-800)",
                margin: "0 auto",
                maxWidth: "52ch",
                textAlign: "center",
              }}
            >
              Now you might be curious about how exactly we build our reading lists, so let&rsquo;s talk about that.
            </p>
          </div>
        </div>
      </section>

      <section id="how-we-find-the-books" style={{ scrollMarginTop: 130, padding: "0 var(--gutter-screen)" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: "var(--surface-card)",
            borderRadius: "var(--radius-2xl)",
            boxShadow: "var(--shadow-raised)",
            overflow: "hidden",
          }}
        >
          <div style={{ background: "var(--sky-200)", padding: "clamp(28px,3.4vw,48px) clamp(24px,4vw,64px)" }}>
            <span style={{ font: "var(--type-label)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--sky-700)" }}>
              Our methodology
            </span>
            <h2
              style={{
                font: "var(--weight-bold) clamp(26px,3.8vw,44px)/1.08 var(--font-display)",
                letterSpacing: "var(--tracking-tight)",
                color: "var(--ink-900)",
                margin: "14px 0 0",
              }}
            >
              How we find the books
            </h2>
          </div>
          <div style={{ padding: "clamp(28px,3.6vw,56px) clamp(24px,4vw,64px)", display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ font: "var(--type-quote)", color: "var(--ink-800)", margin: 0 }}>Every list starts with a lot of digging.</p>
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
              For each theme, we analyse multiple independent reader discussions and gather the books people recommend
              across them.
            </p>
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
              Depending on the theme, that can leave us with hundreds or even thousands of individual recommendations
              to work through.
            </p>
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>From there, we review those recommendations one by one.</p>
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
              We check that each person is genuinely recommending the book for the specific thing we&rsquo;re
              researching, rather than simply mentioning it in the conversation. We also verify every book through our
              internal system to make sure we have the right title and accurate metadata.
            </p>
            <p
              style={{
                font: "var(--weight-bold) clamp(19px,2.2vw,25px)/1.3 var(--font-display)",
                letterSpacing: "var(--tracking-tight)",
                color: "var(--ink-900)",
                margin: "10px 0 0",
              }}
            >
              Then we analyse the verified recommendations.
            </p>
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
              This allows us to see not just which books were mentioned, but how often readers independently
              recommended each one across the discussions we analysed. And that&rsquo;s what we&rsquo;re really
              looking for. We want to know which books readers themselves keep putting forward.
            </p>
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
              Once all of that research is brought together, we finally have enough evidence to put the top books into
              our internal book recommendation database for that specific theme or reader request. And this database
              is what powers the FNFE publication and every Reading Room newsletter.
            </p>
            <div style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: 22 }}>
              <p style={{ font: "var(--type-body)", color: "var(--ink-500)", margin: 0 }}>
                Ps. You might have noticed that at the top of every reading list we have a tiny &ldquo;
                <strong style={{ color: "var(--ink-700)" }}>How we made this list</strong>&rdquo; note. Well,
                that&rsquo;s a tidbit that shares the breadth of research that was undertaken to find the book
                recommendations in the specific list you&rsquo;re reading.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(56px,7vw,100px) var(--gutter-screen) 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p
            style={{
              font: "var(--weight-regular) clamp(18px,1.9vw,24px)/1.5 var(--font-body)",
              color: "var(--ink-800)",
              margin: "0 auto 28px",
              maxWidth: "52ch",
              textAlign: "center",
            }}
          >
            Now, by this point it should go without saying; however, we&rsquo;d like to spell out that:
          </p>
          <div style={{ background: "var(--surface-card)", borderRadius: "var(--radius-2xl)", boxShadow: "var(--shadow-raised)", overflow: "hidden" }}>
            <div style={{ background: "var(--oat-200)", padding: "clamp(28px,3.4vw,48px) clamp(24px,4vw,64px)" }}>
              <span style={{ font: "var(--type-label)", letterSpacing: "var(--tracking-caps)", textTransform: "uppercase", color: "var(--clay-700)" }}>
                Editorial independence
              </span>
              <h2
                style={{
                  font: "var(--weight-bold) clamp(26px,3.8vw,44px)/1.08 var(--font-display)",
                  letterSpacing: "var(--tracking-tight)",
                  color: "var(--ink-900)",
                  margin: "14px 0 0",
                  textWrap: "pretty",
                }}
              >
                Our recommendations aren&rsquo;t for sale
              </h2>
            </div>
            <div style={{ padding: "clamp(28px,3.6vw,56px) clamp(24px,4vw,64px)", display: "flex", flexDirection: "column", gap: 18 }}>
              <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
                The books that make our lists get there because of the reader recommendation evidence behind them.
              </p>
              <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
                While FNFE may make money through advertising, sponsorships, and affiliate relationships, those
                commercial relationships do not influence which books we recommend in our reading lists.
              </p>
              <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
                Publishers, authors, advertisers, sponsors, and other commercial partners can&rsquo;t pay to change
                those results.
              </p>
              <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
                Any paid book promotions, whether on our website or in a Reading Room issue, will always be clearly
                labelled as an advertisement or sponsorship.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(56px,7vw,100px) var(--gutter-screen) 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2
            style={{
              font: "var(--weight-bold) clamp(24px,3.4vw,38px)/1.12 var(--font-display)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--ink-900)",
              margin: 0,
              textAlign: "center",
            }}
          >
            A note from the founder
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              marginTop: 28,
              background: "var(--sky-200)",
              borderRadius: "var(--radius-2xl)",
              boxShadow: "var(--shadow-raised)",
              padding: "clamp(28px,3.6vw,48px) clamp(24px,4vw,56px)",
            }}
          >
            <p style={{ font: "var(--type-quote)", color: "var(--ink-800)", margin: 0 }}>
              Hi, I&rsquo;m Dami, the founder of Field Notes From Everywhere (and the person writing this About page).
            </p>
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
              Like most readers, I&rsquo;ve often found myself scouring internet book communities for recommendations.
              And over the years, that has led me to some books I&rsquo;ve loved, some spectacular failures, and a lot
              of time spent digging through conversations trying to find exactly what I was looking for.
            </p>
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
              Eventually, I started wondering why finding those recommendations had to be so much work. There&rsquo;s
              no shortage of people talking about books online. And buried inside all those conversations are some
              genuinely great recommendations.
            </p>
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
              So, I decided to build the product I wished already existed. And thus, Field Notes From Everywhere was
              born.
            </p>
            <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
              I truly hope you enjoy these book recommendation lists as much as I enjoy creating them.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "clamp(56px,7vw,100px) var(--gutter-screen) clamp(64px,8vw,112px)" }}>
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
            textAlign: "center",
            background: "var(--oat-200)",
            borderRadius: "var(--radius-2xl)",
            padding: "clamp(32px,4vw,56px) clamp(24px,4vw,56px)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <h2
            style={{
              font: "var(--weight-bold) clamp(22px,3vw,32px)/1.14 var(--font-display)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--ink-900)",
              margin: 0,
            }}
          >
            Want to get in touch?
          </h2>
          <p style={{ font: "var(--type-body)", color: "var(--ink-700)", margin: 0 }}>
            Have a question, suggestion, or just want to say hello? We&rsquo;d love to hear from you.
          </p>
          <a
            href={`mailto:${settings.contactEmail}`}
            style={{
              font: "var(--weight-bold) clamp(17px,2vw,25px)/1.2 var(--font-display)",
              letterSpacing: "var(--tracking-tight)",
              color: "var(--accent-primary)",
              textDecoration: "underline",
              textUnderlineOffset: 5,
            }}
          >
            {settings.contactEmail}
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
