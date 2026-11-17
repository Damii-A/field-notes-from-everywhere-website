import Link from "next/link";
import styles from "./Footer.module.css";
import { Icon } from "./ds/Icon";
import { CATEGORY_LIST, getRankingListsIndex, getSiteSettings, rankingListsPath } from "@/lib/content";
import { FooterNewsletterForm } from "./FooterNewsletterForm";
import { CookieSettingsLink } from "./CookieSettingsLink";

const CURRENT_YEAR = new Date().getFullYear();

const SITE_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-and-cookies", label: "Privacy & Cookies" },
  { href: "/terms", label: "Terms" },
  { href: "/disclosures", label: "Disclosures" },
];

/** Ported from the design's `Site Footer.dc.html`, imported on every page. */
export async function Footer() {
  const [{ socialLinks }, rankingLists] = await Promise.all([getSiteSettings(), getRankingListsIndex()]);
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
          {rankingLists.length > 0 ? (
            // Each ranking's "book lists" page (user, 2026-11-17), under the columns so the footer keeps its shape.
            <>
              <span className={`${styles.columnLabel} ${styles.subLabel}`}>Book lists by genre</span>
              {rankingLists.map((r) => (
                <Link key={r.slug} href={rankingListsPath(r.slug)} className={styles.siteLink}>
                  {r.name}
                </Link>
              ))}
            </>
          ) : null}
        </div>
        <div className={styles.column}>
          <span className={styles.columnLabel}>Field Notes From Everywhere</span>
          {SITE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.siteLink}>
              {link.label}
            </Link>
          ))}
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && <CookieSettingsLink className={styles.siteLink} />}
        </div>
        <div className={styles.column}>
          <FooterNewsletterForm labelClassName={styles.columnLabel} />
        </div>
        <div className={styles.socials}>
          {/* URLs from Site Settings, falling back to the defaults in getSiteSettings */}
          {socialLinks.pinterest && (
            <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className={styles.socialButton}>
              <Icon name="pinterest" size={22} color="#E60023" /> {/* Pinterest brand red */}
            </a>
          )}
          {socialLinks.reddit && (
            <a href={socialLinks.reddit} target="_blank" rel="noopener noreferrer" aria-label="Reddit" className={styles.socialButton}>
              <Icon name="reddit" size={22} color="#FF4500" /> {/* Reddit brand orange */}
            </a>
          )}
        </div>
      </div>
      <div className={styles.close}>
        <span className={styles.wordmark}>Field Notes From Everywhere</span>
        <span className={styles.copyright}>© {CURRENT_YEAR} Field Notes From Everywhere. All rights reserved.</span>
      </div>
    </footer>
  );
}
