"use client";

import { useState, type FormEvent } from "react";
import styles from "./FooterNewsletterForm.module.css";

/**
 * Site-wide free-list signup, added to the footer 2026-09-23 — the design
 * never specified a newsletter-signup UI beyond the article "send this list
 * to me" popup, so this is the site's first standalone entry point for
 * `source: "newsletter"` on /api/subscribe (see DECISIONS.md).
 */
export function FooterNewsletterForm({ labelClassName }: { labelClassName?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, source: "newsletter" }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const label = <span className={labelClassName}>Join the list</span>;

  if (status === "success") {
    return (
      <div className={styles.box}>
        {label}
        <p className={styles.message} style={{ color: "var(--status-positive)" }}>
          You&rsquo;re on the list — welcome!
        </p>
      </div>
    );
  }

  // One box, one gap: every element inside is spaced by .box's `gap`.
  return (
    <form onSubmit={handleSubmit} className={styles.box}>
      {label}
      <input
        type="text"
        required
        placeholder="First name"
        autoComplete="given-name"
        aria-label="First name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />
      <input
        type="email"
        required
        placeholder="Email address"
        autoComplete="email"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />
      <button type="submit" disabled={status === "sending"} className={styles.submit}>
        {status === "sending" ? "Joining…" : "Join the list"}
      </button>
      {status === "error" ? (
        <p className={styles.message} style={{ color: "var(--status-critical)" }}>
          Something went wrong — please try again.
        </p>
      ) : null}
      <p className={styles.fine}>New reading lists from the Publication, roughly weekly. Unsubscribe any time.</p>
    </form>
  );
}
