"use client";

import { useEffect, useState } from "react";
import { Icon } from "./ds/Icon";
import styles from "./ShareButtons.module.css";

/**
 * Article sharing: Pinterest, Reddit, Facebook, X, copy link, and (where the
 * browser has one, i.e. phones) the device's own share sheet. The user's
 * addition, 2026-09-27 (DECISIONS.md): pub_article.md §6.3 originally asked
 * for a copy-link control only, with no row of social buttons.
 *
 * `rail` is the vertical floating control beside the article on wide
 * desktops; `row` is the inline version used under the byline (where the
 * rail doesn't fit) and at the end of the book list.
 */
export function ShareButtons({
  url,
  title,
  image,
  layout,
  heading,
  className,
}: {
  url: string;
  title: string;
  image?: string;
  layout: "rail" | "row";
  heading?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    // Only offered on touch devices: desktop browsers' share sheets are sparse, and the brand buttons cover them.
    setCanNativeShare(typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const networks = [
    { name: "Pinterest", icon: "pinterest", color: "#E60023", href: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}${image ? `&media=${encodeURIComponent(image)}` : ""}` },
    { name: "Reddit", icon: "reddit", color: "#FF4500", href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
    { name: "Facebook", icon: "facebook", color: "#0866FF", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "X", icon: "x-logo", color: "#000000", href: `https://x.com/intent/post?url=${u}&text=${t}` },
  ];

  function copyLink() {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done);
    else done();
  }

  function nativeShare() {
    // A cancelled share sheet rejects; nothing to do.
    navigator.share({ title, url }).catch(() => {});
  }

  const rail = layout === "rail";

  return (
    <div className={`${rail ? styles.rail : styles.row} ${className ?? ""}`.trim()}>
      {heading ? <span className={styles.heading}>{heading}</span> : null}
      <div className={styles.buttons}>
        {networks.map((n) => (
          <a
            key={n.name}
            href={n.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${n.name}`}
            title={`Share on ${n.name}`}
            className={styles.button}
          >
            <Icon name={n.icon} size={rail ? 20 : 19} color={n.color} />
          </a>
        ))}
        <button type="button" onClick={copyLink} aria-label="Copy article link" title="Copy link" className={styles.button}>
          <Icon name="link" size={rail ? 20 : 19} />
        </button>
        {canNativeShare && !rail ? (
          <button type="button" onClick={nativeShare} aria-label="More ways to share" title="More ways to share" className={styles.button}>
            <Icon name="share" size={19} />
          </button>
        ) : null}
      </div>
      <span className={styles.status} role="status">
        {copied ? "Link copied!" : rail ? "Share" : ""}
      </span>
    </div>
  );
}
