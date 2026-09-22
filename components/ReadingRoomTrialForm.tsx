"use client";

import { useState, type FormEvent } from "react";
import styles from "./ReadingRoomTrialForm.module.css";

/**
 * Reading Room's "Join for free" / "Join The Reading Room" CTAs — email
 * capture only, no Paddle checkout (see DECISIONS.md, "Reading Room's free
 * trial is tracked in Kit, not as a Paddle trial"). Clicking the CTA reveals
 * an inline email field; submitting posts to /api/reading-room/start-trial.
 */
export function ReadingRoomTrialForm({ ctaClassName, children }: { ctaClassName?: string; children: React.ReactNode }) {
  const [phase, setPhase] = useState<"idle" | "form" | "sending" | "success" | "error">("idle");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPhase("sending");
    try {
      const res = await fetch("/api/reading-room/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setPhase("success");
    } catch {
      setPhase("error");
    }
  }

  if (phase === "success") {
    return <p className={styles.message} style={{ color: "var(--status-positive)" }}>You&rsquo;re in! Check your inbox to get started.</p>;
  }

  if (phase === "idle") {
    return (
      <button type="button" className={ctaClassName} onClick={() => setPhase("form")}>
        {children}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="email"
        required
        autoFocus
        placeholder="Email address"
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
