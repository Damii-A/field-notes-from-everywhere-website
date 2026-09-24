import Link from "next/link";
import styles from "./Footer.module.css";
import { Icon } from "./ds/Icon";
import { CATEGORY_LIST } from "@/lib/content";
import { FooterNewsletterForm } from "./FooterNewsletterForm";

const CURRENT_YEAR = new Date().getFullYear();

const SITE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-and-cookies", label: "Privacy & Cookies" },
  { href: "/terms", label: "Terms" },
  { href: "/disclosures", label: "Disclosures" },
];

/** Ported from the design's `Site Footer.dc.html`, imported on every page. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <span className={styles.columnLabel}>Explore</span>
          {CATEGORY_LIST.map((cat) => (
            <Link key={cat.slug} href={`/${cat.slug}`} className={styles.exploreLink}>
              {cat.name}
            </Link>
          ))}
          <Link href="/the-reading-room" className={styles.exploreLink}>
            The Reading Room
          </Link>
        </div>
        <div className={styles.column}>
          <span className={styles.columnLabel}>Field Notes From Everywhere</span>
          {SITE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.siteLink}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className={styles.column}>
          <FooterNewsletterForm labelClassName={styles.columnLabel} />
        </div>
        <div className={styles.socials}>
          {/* href="#" until real social URLs are supplied — see CURRENT_STATE.md */}
          <a href="#" aria-label="Pinterest" className={styles.socialButton}>
            <Icon name="pinterest" size={22} color="#E60023" /> {/* Pinterest brand red */}
          </a>
          <a href="#" aria-label="Reddit" className={styles.socialButton}>
            <Icon name="reddit" size={22} color="#FF4500" /> {/* Reddit brand orange */}
          </a>
        </div>
      </div>
      <div className={styles.close}>
        <span className={styles.wordmark}>Field Notes From Everywhere</span>
        <span className={styles.copyright}>© {CURRENT_YEAR} Field Notes From Everywhere. All rights reserved.</span>
      </div>
    </footer>
  );
}
