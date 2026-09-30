import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ReadingRoomCheckoutButton } from "@/components/ReadingRoomCheckoutButton";
import styles from "./Subscribe.module.css";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Subscribe — The Reading Room",
    description: "Confirm your Reading Room subscription — $7/month, cancel anytime.",
    path: "/the-reading-room/subscribe",
  }),
  robots: { index: false, follow: true },
};

/**
 * The single destination every "Join The Reading Room" CTA points to,
 * rather than each triggering Paddle checkout independently. Reached by
 * someone who's already decided to pay, so it doesn't re-explain what The
 * Reading Room is — that's the landing page's job. (While the free trial is
 * paused, DECISIONS.md 2026-09-27, this is the only way in.)
 */
export default async function ReadingRoomSubscribePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Join The Reading Room</h1>
          <p className={styles.body}>
            You&rsquo;re one step away from every Reading Room catalogue, sent every Tuesday, Thursday and Saturday.
          </p>
          <p className={styles.priceNote}>$7/month. Cancel anytime.</p>
          <ReadingRoomCheckoutButton className={styles.cta}>Subscribe now</ReadingRoomCheckoutButton>
          <Link href="/the-reading-room" className={`${styles.back} tap-area`}>
            Not ready yet? Back to The Reading Room
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
