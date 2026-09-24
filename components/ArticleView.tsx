"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Icon } from "./ds/Icon";
import { BookCover } from "./ds/BookCover";
import { ImagePlaceholder } from "./ImagePlaceholder";
import styles from "./ArticleView.module.css";
import type { Article, CategorySlug } from "@/lib/content";
import { CATEGORIES } from "@/lib/content/categories"; // not "@/lib/content": that pulls server-only fetching into this client component

const CATEGORY_LABEL: Record<CategorySlug, string> = {
  "the-shortlist": "The Shortlist",
  "what-to-read-when": "What to Read When",
  "book-club-book-picks": "Book Club Book Picks",
};

// Per-category visual identity for the elements that vary — mirrors the
// distinct treatment of each category's built article template (see
// docs/design-specs/pub_hub.md "Category-Specific Visual Direction" and the
// actual per-page styles read from Article - *.dc.html during
// implementation).
const CATEGORY_STYLE: Record<
  CategorySlug,
  {
    pageBg: string;
    titleColor: string;
    tagBg: string;
    tagColor: string;
    methodologyBorder: string;
    heroRadius: string;
    rrBannerBg: string;
    rrBannerLabelColor: string;
    rrBannerFineColor: string;
    rrBannerCtaBg: string;
    rrBannerCtaColor: string;
    floatAdBorder: string;
    floatAdLabelColor: string;
    progressAccent: string;
  }
> = {
  "the-shortlist": {
    pageBg: "var(--sage-100)",
    titleColor: "var(--sage-700)",
    tagBg: "var(--sage-700)",
    tagColor: "var(--paper-050)",
    methodologyBorder: "var(--sage-600)",
    heroRadius: "var(--radius-lg)",
    rrBannerBg: "var(--sage-700)",
    rrBannerLabelColor: "var(--paper-050)",
    rrBannerFineColor: "var(--paper-050)",
    rrBannerCtaBg: "var(--sage-100)",
    rrBannerCtaColor: "var(--ink-900)",
    floatAdBorder: "var(--sage-500)",
    floatAdLabelColor: "var(--sage-700)",
    progressAccent: "var(--sage-700)",
  },
  "what-to-read-when": {
    pageBg: "var(--paper-100)",
    titleColor: "var(--clay-700)",
    tagBg: "var(--clay-300)",
    tagColor: "var(--ink-900)",
    methodologyBorder: "var(--clay-500)",
    heroRadius: "46% 54% 50% 50%/10% 10% 12% 12%",
    rrBannerBg: "var(--clay-300)",
    rrBannerLabelColor: "var(--ink-700)",
    rrBannerFineColor: "var(--ink-700)",
    rrBannerCtaBg: "var(--slate-700)",
    rrBannerCtaColor: "var(--paper-050)",
    floatAdBorder: "var(--clay-400)",
    floatAdLabelColor: "var(--clay-700)",
    progressAccent: "var(--clay-700)",
  },
  "book-club-book-picks": {
    pageBg: "var(--paper-050)",
    titleColor: "var(--slate-600)",
    tagBg: "var(--slate-600)",
    tagColor: "var(--paper-050)",
    methodologyBorder: "var(--sky-600)",
    heroRadius: "var(--radius-lg)",
    rrBannerBg: "var(--sky-200)",
    rrBannerLabelColor: "var(--ink-700)",
    rrBannerFineColor: "var(--ink-800)",
    rrBannerCtaBg: "var(--slate-700)",
    rrBannerCtaColor: "var(--paper-050)",
    floatAdBorder: "var(--sky-500)",
    floatAdLabelColor: "var(--sky-700)",
    progressAccent: "var(--sky-700)",
  },
};

export function ArticleView({ article }: { article: Article }) {
  const category = article.category;
  const identity = CATEGORIES[category];
  const style = CATEGORY_STYLE[category];
  const ranked = identity.ranked;

  const [progress, setProgress] = useState(0);
  const [index, setIndex] = useState(0);
  const [inList, setInList] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [roomForShare, setRoomForShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popup, setPopup] = useState(false);
  const [, setPopupDone] = useState(false);
  const [, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const list = document.getElementById("book-list");
      const vh = window.innerHeight;
      if (list) {
        const r = list.getBoundingClientRect();
        const span = r.height - vh * 0.5;
        const p = Math.min(1, Math.max(0, (vh * 0.5 - r.top) / (span || 1)));
        const nowInList = r.top < vh * 0.65 && r.bottom > vh * 0.35;
        const nowIndex = Math.min(article.books.length, Math.max(1, Math.ceil(p * article.books.length) || 1));
        setProgress(p);
        setInList(nowInList);
        setIndex(nowIndex);
      }
      const doc = document.documentElement;
      const scrolled = (window.scrollY + vh) / doc.scrollHeight;
      if (window.scrollY > vh * 0.9 && scrolled > 0.5) {
        setPopupDone((done) => {
          if (!done) {
            setDismissed((dis) => {
              if (!dis) setPopup(true);
              return dis;
            });
          }
          return true;
        });
      }
    };
    const onResize = () => {
      setNarrow(window.innerWidth < 1140);
      setRoomForShare(window.innerWidth >= 1308);
    };
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [article.books.length]);

  function copyLink() {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done);
    else done();
  }

  const showRail = !narrow;
  const showProgress = inList && !narrow;
  const showFloatAd = !inList && !narrow;
  const showShare = roomForShare;

  return (
    <div style={{ background: style.pageBg }}>
      <div className={styles.layout}>
        <article className={styles.article}>
          <h1 className={styles.title} style={{ color: style.titleColor }}>
            {article.title}
          </h1>
          <Link
            href={`/${category}`}
            className={styles.categoryTag}
            style={{ background: style.tagBg, color: style.tagColor }}
          >
            {CATEGORY_LABEL[category]}
          </Link>

          <div className={styles.bylineRow}>
            <span className={styles.byline}>By {article.author}</span>
            <span className={styles.bylineDot} />
            <span className={styles.bylineDate}>
              {new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <div className={styles.methodologyBox} style={{ borderLeftColor: style.methodologyBorder }}>
            <span className={styles.methodologyLabel}>How we made this list</span>
            <p className={styles.methodologyText}>
              {article.methodologySentence} <Link href="/about#how-we-find-the-books">How we find the books</Link>
            </p>
          </div>

          <div className={styles.hero} style={{ borderRadius: style.heroRadius }}>
            <ImagePlaceholder label={article.heroImage?.alt ?? "Article image"} src={article.heroImage?.url} />
          </div>

          <div className={styles.intro}>
            {article.introParagraphs.map((p, i) => (
              <p key={i} className={styles.introP}>
                {p}
              </p>
            ))}
          </div>

          <div id="book-list" className={styles.bookList}>
            {article.books.map((book, i) => {
              const showCallout = (i + 1) % 5 === 0 && i !== article.books.length - 1;
              return (
                <div key={`${book.title}-${i}`}>
                  <div className={styles.bookRow}>
                    {ranked ? (
                      <span className={styles.bookRank} style={{ color: style.titleColor }}>
                        {i + 1}
                      </span>
                    ) : null}
                    <BookCover
                      title={book.title}
                      author={book.author}
                      spine={book.spine}
                      src={book.coverImage?.url}
                      alt={book.coverImage ? `Cover of ${book.title} by ${book.author}` : undefined}
                      width={ranked ? 104 : 112}
                      ratio={1.5}
                    />
                    <div className={styles.bookBody}>
                      <span className={styles.bookTitle} style={{ color: style.titleColor }}>
                        {book.title}
                      </span>
                      <span className={styles.bookAuthor}>{book.author}</span>
                      {book.tags && book.tags.length > 0 ? (
                        <div className={styles.tagRow}>
                          {book.tags.map((t) => (
                            <span key={t.slug} className={styles.tag}>
                              {t.label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className={styles.bookBlurb}>{book.blurb}</p>
                    </div>
                  </div>
                  {showCallout ? (
                    <div className={styles.callout} style={{ background: "var(--paper-050)", border: `1px solid ${style.methodologyBorder}` }}>
                      <span className={styles.calloutText}>Want us to send you this book list?</span>
                      <button
                        type="button"
                        className={styles.calloutButton}
                        style={{ color: style.titleColor }}
                        onClick={() => {
                          setPopup(true);
                          setPopupDone(true);
                          setDismissed(false);
                        }}
                      >
                        Send this list to me
                      </button>
                      <span className={styles.calloutNote}>
                        You&rsquo;ll also join the free Field Notes From Everywhere email list. Unsubscribe any time.
                      </span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <aside className={styles.rrBanner} style={{ background: style.rrBannerBg }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: "44ch" }}>
              <span className={styles.rrBannerLabel} style={{ color: style.rrBannerLabelColor }}>
                The Reading Room by FNFE
              </span>
              <span className={styles.rrBannerHeadline}>Get 30+ book recommendations, delivered to your inbox six days a week.</span>
              <span className={styles.rrBannerFine} style={{ color: style.rrBannerFineColor }}>
                7 days free, no credit card. $7/month after that.
              </span>
            </div>
            <Link href="/the-reading-room" className={styles.rrBannerCta} style={{ background: style.rrBannerCtaBg, color: style.rrBannerCtaColor }}>
              Take a look
            </Link>
          </aside>

          {article.whatToReadNext.length > 0 ? (
            <section className={styles.wtrn}>
              <h2 className={styles.wtrnHeading}>What to read next</h2>
              <div className={styles.wtrnGrid}>
                {article.whatToReadNext.map((next) => (
                  <Link key={next.slug} href={`/${next.category}/${next.slug}`} className={styles.wtrnCard}>
                    <div className={styles.wtrnImage}>
                      <ImagePlaceholder label="Article image" src={next.heroImage?.url} alt={next.heroImage?.alt} />
                    </div>
                    <span className={styles.wtrnTitle}>{next.title}</span>
                    <span className={styles.wtrnChip}>{CATEGORY_LABEL[next.category]}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        {showRail ? (
          <aside className={styles.rail}>
            {showProgress ? <ProgressRail category={category} accent={style.progressAccent} index={index} total={article.books.length} progress={progress} /> : null}
            {showFloatAd ? (
              <aside className={styles.floatAd} style={{ border: `1px solid ${style.floatAdBorder}` }}>
                <span className={styles.floatAdLabel} style={{ color: style.floatAdLabelColor }}>
                  The Reading Room
                </span>
                <span className={styles.floatAdHeadline}>Get 30+ book recommendations, delivered to your inbox six days a week.</span>
                <p className={styles.floatAdFine}>Your first 7 days are on us then it&rsquo;s $7/month after that. Cancel anytime</p>
                <Link href="/the-reading-room" className={styles.floatAdCta}>
                  Take a look
                </Link>
              </aside>
            ) : null}
          </aside>
        ) : null}
      </div>

      {showShare ? (
        <div className={styles.shareRail}>
          <button type="button" onClick={copyLink} aria-label="Copy article link" className={styles.shareButton}>
            <Icon name="link" size={20} />
          </button>
          <span className={styles.shareLabel}>{copied ? "Link copied!" : "Copy link"}</span>
        </div>
      ) : null}

      {popup ? (
        <SendListPopup
          bookCount={article.books.length}
          articleSlug={article.slug}
          category={category}
          accent={style.titleColor}
          onClose={() => {
            setPopup(false);
            setDismissed(true);
          }}
        />
      ) : null}
    </div>
  );
}

function ProgressRail({
  category,
  accent,
  index,
  total,
  progress,
}: {
  category: CategorySlug;
  accent: string;
  index: number;
  total: number;
  progress: number;
}) {
  if (category === "what-to-read-when") {
    const pathLength = 320;
    return (
      <div className={styles.progressWrap} style={{ alignItems: "center" }} aria-hidden="true">
        <svg viewBox="0 0 60 240" style={{ width: 60, height: 240, overflow: "visible" }}>
          <path d="M30 4 C6 40 54 74 30 112 C6 150 54 182 30 236" fill="none" stroke="var(--clay-200)" strokeWidth={2} strokeLinecap="round" />
          <path
            d="M30 4 C6 40 54 74 30 112 C6 150 54 182 30 236"
            fill="none"
            stroke={accent}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={Math.round(pathLength * (1 - progress))}
            style={{ transition: "stroke-dashoffset var(--dur-slow) var(--ease-out)" }}
          />
        </svg>
        <span className={styles.progressOf}>
          {index} of {total}
        </span>
      </div>
    );
  }

  if (category === "book-club-book-picks") {
    return (
      <div className={styles.progressWrap} style={{ alignItems: "center", gap: 0 }} aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span
              style={{
                width: i < index ? 11 : 7,
                height: i < index ? 11 : 7,
                borderRadius: "50%",
                background: i < index ? accent : "var(--clay-300)",
                transition: "background var(--dur-med) var(--ease-out), width var(--dur-med) var(--ease-out), height var(--dur-med) var(--ease-out)",
              }}
            />
            {i < total - 1 ? (
              <span
                style={{
                  width: 1,
                  height: 16,
                  background: i < index - 1 ? "var(--sky-600)" : "var(--clay-300)",
                  transition: "background var(--dur-med) var(--ease-out)",
                }}
              />
            ) : null}
          </span>
        ))}
        <span className={styles.progressOf} style={{ marginTop: 8 }}>
          {index}/{total}
        </span>
      </div>
    );
  }

  // The Shortlist — a straight fill bar.
  return (
    <div className={styles.progressWrap}>
      <span className={styles.progressIndex} style={{ color: accent }}>
        {index}
      </span>
      <span className={styles.progressOf}>of {total}</span>
      <div className={styles.progressBarTrack}>
        <span className={styles.progressBarFill} style={{ height: `${Math.round(progress * 100)}%`, background: accent }} />
      </div>
    </div>
  );
}

function SendListPopup({
  bookCount,
  articleSlug,
  category,
  accent,
  onClose,
}: {
  bookCount: number;
  articleSlug: string;
  category: CategorySlug;
  accent: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source: "send-list", articleSlug, category }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <div onClick={onClose} aria-hidden="true" className={styles.overlay} />
      <div className={styles.popup}>
        <div className={styles.popupHeader}>
          <span className={styles.popupHeading}>Want us to send this book list to your email?</span>
          <button type="button" onClick={onClose} aria-label="Close" className={styles.popupClose}>
            <Icon name="x" size={18} />
          </button>
        </div>
        {status === "sent" ? (
          <p className={styles.popupBody}>Sent! Check your inbox — and welcome to the free FNFE list.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className={styles.popupBody}>
              Enter your email below and we&rsquo;ll send you a list with all {bookCount} recommendations.
            </p>
            <div className={styles.popupForm}>
              <input
                type="text"
                required
                placeholder="First name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.popupInput}
              />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.popupInput}
              />
              <button type="submit" disabled={status === "sending"} className={styles.popupSubmit} style={{ background: accent }}>
                {status === "sending" ? "Sending…" : "Send it"}
              </button>
            </div>
            {status === "error" ? (
              <p className={styles.popupBody} style={{ color: "var(--status-critical)" }}>
                Something went wrong — please try again.
              </p>
            ) : null}
            <p className={`${styles.popupBody} ${styles.popupFine}`}>
              You&rsquo;ll also join the free Field Notes From Everywhere Publication email list. Unsubscribe any
              time.
            </p>
          </form>
        )}
      </div>
    </>
  );
}
