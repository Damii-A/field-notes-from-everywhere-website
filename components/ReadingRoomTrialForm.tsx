"use client";

import { useState, type FormEvent } from "react";
import styles from "./ReadingRoomTrialForm.module.css";

/**
 * Reading Room's "Try it free" CTAs (hero + trial section) — email
 * capture only, no Paddle checkout (see DECISIONS.md, "Reading Room's free
 * trial is tracked in Kit, not as a Paddle trial"). Clicking the CTA reveals
 * an inline email field; submitting posts to /api/reading-room/start-trial.
 */
export function ReadingRoomTrialForm({
  ctaClassName,
  formClassName,
  children,
}: {
  ctaClassName?: string;
  /** Applied to the expanded form (and success/error message) alongside the base styles — use this to reposition the expanded state relative to sibling CTAs, e.g. onto its own line above a button row, without affecting the idle button. */
  formClassName?: string;
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<"idle" | "form" | "sending" | "success" | "error">("idle");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPhase("sending");
    try {
      const res = await fetch("/api/reading-room/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error("request failed");
      setPhase("success");
    } catch {
      setPhase("error");
    }
  }

  if (phase === "success") {
    return (
      <p className={`${styles.message} ${formClassName ?? ""}`.trim()} style={{ color: "var(--status-positive)" }}>
        You&rsquo;re in! Check your inbox to get started.
      </p>
    );
  }

  if (phase === "idle") {
    return (
      <button type="button" className={ctaClassName} onClick={() => setPhase("form")}>
        {children}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${formClassName ?? ""}`.trim()}>
      <input
        type="text"
        required
        autoFocus
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
      <button type="submit" className={ctaClassName} disabled={phase === "sending"}>
        {phase === "sending" ? "Joining…" : "Start free trial"}
      </button>
      {phase === "error" ? (
        <p className={styles.message} style={{ color: "var(--status-critical)", width: "100%" }}>
          Something went wrong — please try again.
        </p>
      ) : null}
    </form>
  );
}
