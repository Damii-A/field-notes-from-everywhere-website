import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BookCover } from "@/components/ds/BookCover";
import { NewsletterSignupButton } from "@/components/NewsletterSignupButton";
import { getRecommendedCovers } from "@/lib/content";
import styles from "./ReadingRoom.module.css";

/*
 * The Reading Room is paused (user, 2026-10-23; DECISIONS.md): this address
 * shows a short "taking a break" note with the free-newsletter signup, in the
 * landing page's own hero. The landing page itself is kept in ReadingRoomLanding.tsx.
 */
export const metadata: Metadata = {
  ...pageMetadata({
    title: "The Reading Room",
    description: "The Reading Room is taking a break. In the meantime, join our free weekly newsletter.",
    path: "/the-reading-room",
  }),
  robots: { index: false, follow: true },
};

const SPINES = ["var(--slate-600)", "var(--clay-600)", "var(--sky-600)", "var(--sage-600)", "var(--clay-700)", "var(--sky-700)"];

export default async function ReadingRoomPausedPage() {
  const covers = await getRecommendedCovers(24);
  const doubled = [...covers, ...covers]; // two copies, so the drifting row loops seamlessly

  return (
    <>
      <Header />

      <section className={styles.hero} style={{ paddingBlock: "clamp(72px,10vw,144px)" }}>
        <div className={styles.driftLayer} aria-hidden="true">
          <div className={styles.driftTrack}>
            {doubled.map((b, i) => (
              <BookCover key={i} title={b.title} author={b.author} src={b.coverUrl} spine={SPINES[i % SPINES.length]} width={104} ratio={1.5} bookmark={false} />
            ))}
          </div>
        </div>
        <div className={styles.heroScrim} aria-hidden="true" />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>The Reading Room</h1>
          <p className={styles.heroByline}>is taking a break for now</p>
          <p style={{ font: "var(--type-body)", fontSize: "clamp(17px,1.6vw,20px)", lineHeight: 1.6, color: "var(--paper-050)", margin: 0, maxWidth: "46ch", textWrap: "pretty" }}>
            In the meantime, our free newsletter sends you a weekly roundup of the latest book lists we&rsquo;ve
            published.
          </p>
          <NewsletterSignupButton className={styles.heroCta}>Join the free newsletter</NewsletterSignupButton>
        </div>
      </section>

      <Footer />
    </>
  );
}
