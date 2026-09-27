import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCover } from "@/components/ds/BookCover";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { getSiteSettings } from "@/lib/content";
import styles from "./ReadingRoom.module.css";

export const metadata: Metadata = {
  title: "The Reading Room",
  description: "30+ themed book recommendations, Monday through Saturday. $7/month, cancel anytime.",
};

const SPINES = ["var(--slate-600)", "var(--clay-600)", "var(--sky-600)", "var(--sage-600)", "var(--clay-700)", "var(--sky-700)"];

const TITLES: [string, string][] = [
  ["11/22/63", "Stephen King"],
  ["61 Hours", "Lee Child"],
  ["A Boy and His Dog at the End of the World", "C. A. Fletcher"],
  ["A Child Called It", "Dave Pelzer"],
  ["A Crown for Cold Silver", "Alex Marshall"],
  ["A Deadly Education", "Naomi Novik"],
  ["A Drink Before The War", "Dennis Lehane"],
  ["A Feast of Snakes", "Harry Crews"],
  ["A Fine Balance", "Rohinton Mistry"],
  ["A Flicker in the Dark", "Stacy Willingham"],
  ["A Good Girl's Guide to Murder", "Holly Jackson"],
  ["A Great Deliverance", "Elizabeth George"],
];

export default async function ReadingRoomPage() {
  const settings = await getSiteSettings();
  const doubled = [...TITLES, ...TITLES];

  return (
    <>
      <Header />

      <section className={styles.hero}>
        <div className={styles.driftLayer} aria-hidden="true">
          <div className={styles.driftTrack}>
            {doubled.map((b, i) => (
              <BookCover key={i} title={b[0]} author={b[1]} spine={SPINES[i % SPINES.length]} width={104} ratio={1.5} bookmark={false} />
            ))}
          </div>
        </div>
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>The Reading Room</h1>
          <p className={styles.heroByline}>by Field Notes From Everywhere</p>
          {/* The design's "Try it free" + "Subscribe" pair: the free trial is paused
              (DECISIONS.md 2026-09-27), so one button straight to the payment page. */}
          <Link href="/the-reading-room/subscribe" className={styles.heroCta}>
            Join The Reading Room
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span className={styles.kicker}>The daily catalogue</span>
            <h2 className={styles.sectionHeading}>30+ themed book recommendations, Monday through Saturday.</h2>
            <p className={styles.sectionBody}>
              Every catalogue focuses on one specific reader interest. For each one, we analyse hundreds of real
              reader recommendations to find and bring the top picks right to your inbox.
            </p>
            <p className={styles.sectionBody} style={{ color: "var(--clay-700)" }}>
              And if you miss a day, no worries. Every Sunday, we&rsquo;ll send you a recap of all six catalogues from
              the week, so you can easily catch up on anything you missed.
            </p>
          </div>
          <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
            <div className={styles.mockFrame}>
              <div className={styles.mockInner}>
                <ImagePlaceholder label="Screenshot of a Reading Room catalogue email" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.shelfSection}>
        <div className={styles.shelfInner}>
          <span className={styles.shelfLabel}>A few of the books we&rsquo;ve recommended so far</span>
          <div className={styles.shelfMask}>
            <div className={styles.shelfTrack}>
              {doubled.map((b, i) => (
                <div key={i} style={{ position: "relative", flex: "0 0 auto", width: 136, aspectRatio: "2/3", borderRadius: "4px 10px 10px 4px", overflow: "hidden", boxShadow: "var(--shadow-cover)" }}>
                  <ImagePlaceholder label={b[0]} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="join" className={styles.trialSection}>
        <div className={styles.trialInner}>
          <h2 className={styles.trialHeading}>Sound like your kind of thing?</h2>
          <p className={styles.trialBody}>
            Join today and get a new themed catalogue of 30+ book recommendations in your inbox every Monday
            through Saturday, plus a Sunday recap of the week.
          </p>
          <Link href="/the-reading-room/subscribe" className={styles.trialCta}>
            Join The Reading Room
          </Link>
          <p className={styles.trialNote}>{settings.readingRoomPriceCopy}</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
