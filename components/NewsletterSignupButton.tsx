"use client";

import { GENERIC_FORM_ERROR, formErrorMessage } from "@/lib/formError";
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Icon } from "./ds/Icon";
import styles from "./Popup.module.css";

/**
 * A button that opens the free-newsletter signup popup (`source: "newsletter"`
 * on /api/subscribe, like the footer form). It took the Reading Room's place in
 * every promo spot when the Reading Room was paused (user, 2026-10-23;
 * DECISIONS.md), so each spot keeps its own look and only the button changes.
 */
export function NewsletterSignupButton({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} style={{ border: "none", cursor: "pointer", ...style }} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open ? <NewsletterPopup onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function NewsletterPopup({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(GENERIC_FORM_ERROR);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source: "newsletter" }),
      });
      if (!res.ok) {
        setErrorMessage(await formErrorMessage(res));
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMessage(GENERIC_FORM_ERROR);
      setStatus("error");
    }
  }

  return (
    <>
      <div onClick={onClose} aria-hidden="true" className={styles.overlay} />
      <div className={styles.popup} role="dialog" aria-modal="true" aria-labelledby="newsletter-popup-heading">
        <div className={styles.popupHeader}>
          <span id="newsletter-popup-heading" className={styles.popupHeading} role={status === "sent" ? "status" : undefined}>
            {status === "sent" ? "You’re on the list — welcome!" : "Join the free FNFE newsletter"}
          </span>
          <button type="button" onClick={onClose} aria-label="Close" className={styles.popupClose}>
            <Icon name="x" size={18} />
          </button>
        </div>
        {status === "sent" ? (
          <p className={styles.popupBody}>Keep an eye on your inbox for our next roundup of book lists.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className={styles.popupBody}>
              Once a week, we&rsquo;ll send you a roundup of the latest book lists we&rsquo;ve published.
            </p>
            <div className={styles.popupForm} style={{ marginTop: 14 }}>
              <input
                type="text"
                required
                autoFocus
                placeholder="First name"
                autoComplete="given-name"
                aria-label="First name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.popupInput}
              />
              <input
                type="email"
                required
                placeholder="Email address"
                autoComplete="email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.popupInput}
              />
              <button type="submit" disabled={status === "sending"} className={styles.popupSubmit}>
                {status === "sending" ? "Joining…" : "Join"}
              </button>
            </div>
            {status === "error" ? (
              <p className={styles.popupBody} style={{ color: "var(--status-critical)", marginTop: 14 }}>
                {errorMessage}
              </p>
            ) : null}
            <p className={`${styles.popupBody} ${styles.popupFine}`} style={{ marginTop: 14 }}>
              It&rsquo;s free. Unsubscribe any time.
            </p>
          </form>
        )}
      </div>
    </>
  );
}
