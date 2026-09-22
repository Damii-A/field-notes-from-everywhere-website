import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ReadingRoomCheckoutButton } from "@/components/ReadingRoomCheckoutButton";
import styles from "./Subscribe.module.css";

export const metadata: Metadata = {
  title: "Subscribe — The Reading Room",
  description: "Confirm your Reading Room subscription — $7/month, cancel anytime.",
  robots: { index: false, follow: true },
};

/**
 * The single destination every "subscribe"/"keep it going" CTA points to —
 * the Reading Room landing page's own CTA, the trial-issue email nudges,
 * and the post-trial conversion push all link here, rather than each
 * triggering Paddle checkout independently. Reached by someone who's
 * already decided to pay (mid-trial, post-trial, or skipping the trial
 * entirely), so it doesn't re-explain what The Reading Room is — that's
 * the landing page's job.
 */
export default async function ReadingRoomSubscribePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Join The Reading Room</h1>
          <p className={styles.body}>
            You&rsquo;re one step away from full access to every Reading Room catalogue, every day.
          </p>
          <p className={styles.priceNote}>$7/month. Cancel anytime.</p>
          <ReadingRoomCheckoutButton className={styles.cta}>Subscribe now</ReadingRoomCheckoutButton>
          <Link href="/the-reading-room" className={styles.back}>
            Not ready yet? Back to The Reading Room
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
