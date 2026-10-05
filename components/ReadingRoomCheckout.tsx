"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Paddle, PaddleEventData, CheckoutEventsData } from "@paddle/paddle-js";
import styles from "./ReadingRoomCheckout.module.css";

const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production" | undefined) ?? "sandbox";
const PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_READING_ROOM_PRICE_ID;

/** Paddle.js puts its form inside the element with this class (a plain class, not a CSS-module one). */
const FRAME_CLASS = "paddle-checkout-frame";

// Paddle.js takes one event callback, set when it's initialised; this page swaps its own listener in.
let listener: ((event: PaddleEventData) => void) | null = null;
let paddlePromise: Promise<Paddle | undefined> | null = null;

function getPaddle() {
  if (!paddlePromise) {
    paddlePromise = import("@paddle/paddle-js").then(({ initializePaddle }) =>
      initializePaddle({
        token: CLIENT_TOKEN!,
        environment: ENVIRONMENT,
        eventCallback: (event) => listener?.(event),
      }),
    );
  }
  return paddlePromise;
}

function money(amount: number | undefined, currency: string) {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

/**
 * Paddle's inline checkout, embedded in /the-reading-room/subscribe (DECISIONS.md 2026-10-05),
 * with the order summary Paddle requires beside it: what's being bought, how often it renews and
 * for how much, subtotal, tax and total, and a link to the refund policy. Card details only ever
 * go into Paddle's own frame.
 */
export function ReadingRoomCheckout() {
  const configured = Boolean(CLIENT_TOKEN && PRICE_ID);
  const [data, setData] = useState<CheckoutEventsData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "complete">("loading");
  // Paddle's checkout.completed data doesn't always carry the email; keep the last one it gave.
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    let paddle: Paddle | undefined;

    listener = (event) => {
      if (cancelled) return;
      if (event.data) setData(event.data);
      const eventEmail = event.data?.customer?.email;
      if (eventEmail) setEmail(eventEmail);
      switch (event.name) {
        case "checkout.loaded":
          setStatus("ready");
          break;
        case "checkout.completed":
          setStatus("complete");
          paddle?.Checkout.close();
          window.scrollTo({ top: 0 });
          break;
        case "checkout.error":
          // A field-level problem is shown inside Paddle's form; only a form that never loaded is ours to report.
          setStatus((s) => (s === "loading" ? "error" : s));
          break;
      }
    };

    getPaddle()
      .then((p) => {
        if (cancelled) return;
        if (!p) throw new Error("Paddle.js did not load");
        paddle = p;
        p.Checkout.open({
          items: [{ priceId: PRICE_ID!, quantity: 1 }],
          settings: {
            displayMode: "inline",
            frameTarget: FRAME_CLASS,
            frameInitialHeight: 450,
            frameStyle: "width: 100%; min-width: 286px; background-color: transparent; border: none;",
            locale: "en",
            theme: "light",
          },
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      listener = null;
      paddle?.Checkout.close();
    };
  }, [configured]);

  if (status === "complete") {
    return (
      <div className={styles.done} role="status">
        <h2 className={styles.doneHeading}>You&rsquo;re in!</h2>
        <p className={styles.doneBody}>
          Welcome to The Reading Room. Look out for a welcome email from us{email ? <> at <strong>{email}</strong></> : null}, with
          everything you need to know before your first issue.
        </p>
        <Link href="/" className={`${styles.back} tap-area`}>
          Back to Field Notes From Everywhere
        </Link>
      </div>
    );
  }

  const item = data?.items[0];
  const currency = data?.currency_code ?? "USD";
  const recurring = data?.recurring_totals ?? item?.recurring_totals;
  const interval = item?.billing_cycle?.interval ?? "month";
  const loaded = Boolean(data);

  return (
    <div className={styles.layout}>
      <section className={styles.summary} aria-labelledby="order-summary">
        <h2 id="order-summary" className={styles.kicker}>
          Your order
        </h2>
        <div className={styles.product}>
          <p className={styles.productName}>{item?.product.name ?? "The Reading Room"}</p>
          <p className={styles.productDesc}>
            A themed catalogue of 30 book recommendations, every Tuesday, Thursday and Saturday.
          </p>
        </div>
        <dl className={styles.totals} aria-live="polite">
          <div className={styles.row}>
            <dt>Subtotal</dt>
            <dd>{money(data?.totals.subtotal, currency)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Tax</dt>
            <dd>{money(data?.totals.tax, currency)}</dd>
          </div>
          <div className={`${styles.row} ${styles.totalRow}`}>
            <dt>Total due today</dt>
            <dd>{money(data?.totals.total, currency)}</dd>
          </div>
        </dl>
        <p className={styles.renewal}>
          {loaded && recurring
            ? <>Then {money(recurring.total, currency)} every {interval}, until you cancel. Cancel anytime.</>
            : <>$7/month. Cancel anytime.</>}
        </p>
        <p className={styles.small}>
          Tax depends on where you live, and updates once you enter your country. Payments aren&rsquo;t
          refundable; see our <Link href="/terms#refund-policy">refund policy</Link>.
        </p>
        <Link href="/the-reading-room" className={`${styles.back} tap-area`}>
          Not ready yet? Back to The Reading Room
        </Link>
      </section>

      <section className={styles.formCard} aria-label="Payment details">
        {!configured ? (
          <p className={styles.message}>Checkout isn&rsquo;t configured yet. See CURRENT_STATE.md.</p>
        ) : status === "error" ? (
          <p className={styles.message}>
            The payment form couldn&rsquo;t load. Please refresh the page, or email{" "}
            <a href="mailto:hello@fieldnotesfromeverywhere.com">hello@fieldnotesfromeverywhere.com</a> if it keeps happening.
          </p>
        ) : (
          <>
            {status === "loading" ? <p className={styles.message}>Loading the payment form…</p> : null}
            <div className={FRAME_CLASS} />
          </>
        )}
      </section>
    </div>
  );
}
