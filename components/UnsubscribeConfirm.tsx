"use client";

import { useState } from "react";
import { Button } from "./ds/Button";
import { GENERIC_FORM_ERROR, formErrorMessage } from "@/lib/formError";

const headingStyle: React.CSSProperties = {
  font: "var(--weight-bold) clamp(28px,4.4vw,48px)/1.08 var(--font-display)",
  letterSpacing: "var(--tracking-tight)",
  color: "var(--clay-700)",
  margin: 0,
  textWrap: "pretty",
};
const bodyStyle: React.CSSProperties = { font: "var(--type-body)", color: "var(--ink-700)", margin: 0, maxWidth: "44ch" };

/** The confirm step on /unsubscribe: one button, posting the signed link to /api/unsubscribe. */
export function UnsubscribeConfirm({ email, token }: { email: string; token: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(GENERIC_FORM_ERROR);

  async function unsubscribe() {
    setStatus("sending");
    try {
      const res = await fetch(`/api/unsubscribe?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`, { method: "POST" });
      if (!res.ok) {
        setErrorMessage(await formErrorMessage(res));
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErrorMessage(GENERIC_FORM_ERROR);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <>
        <h1 style={headingStyle}>You&rsquo;re unsubscribed</h1>
        <p style={bodyStyle} role="status">
          We won&rsquo;t send any more list emails to <strong>{email}</strong>. You can join again any time from the bottom of
          any page.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 style={headingStyle}>Unsubscribe from our emails?</h1>
      <p style={bodyStyle}>
        <strong>{email}</strong> will stop getting the Field Notes From Everywhere email list, including the weekly
        round-up of new reading lists.
      </p>
      <Button onClick={unsubscribe} disabled={status === "sending"} style={{ marginTop: 6 }}>
        {status === "sending" ? "unsubscribing…" : "unsubscribe"}
      </Button>
      {status === "error" && (
        <p style={{ ...bodyStyle, color: "var(--clay-text)" }} role="alert">
          {errorMessage}
        </p>
      )}
    </>
  );
}
