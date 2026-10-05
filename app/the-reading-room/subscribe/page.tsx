import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ReadingRoomCheckout } from "@/components/ReadingRoomCheckout";
import styles from "./Subscribe.module.css";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Subscribe — The Reading Room",
    description: "Join The Reading Room: $7/month, cancel anytime.",
    path: "/the-reading-room/subscribe",
  }),
  robots: { index: false, follow: true },
};

/**
 * The single destination every "Join The Reading Room" CTA points to. Paddle's payment form is
 * embedded here (inline checkout, DECISIONS.md 2026-10-06) rather than opened as a Paddle pop-up,
 * so paying feels like part of the Reading Room. Reached by someone who's already decided to pay,
 * so it doesn't re-explain what The Reading Room is. (While the free trial is paused,
 * DECISIONS.md 2026-09-27, this is the only way in.)
 */
export default function ReadingRoomSubscribePage() {
  return (
    <>
      <Header />
      <section className={styles.band}>
        <h1 className={styles.heading}>Join The Reading Room</h1>
        <p className={styles.byline}>by Field Notes From Everywhere</p>
      </section>
      <main className={styles.main}>
        <ReadingRoomCheckout />
      </main>
      <Footer />
    </>
  );
}
