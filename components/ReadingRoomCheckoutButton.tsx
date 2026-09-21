"use client";

import { useState } from "react";
import type { Paddle } from "@paddle/paddle-js";

const CLIENT_TOKEN = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
const ENVIRONMENT = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production" | undefined) ?? "sandbox";
const PRICE_ID = process.env.NEXT_PUBLIC_PADDLE_READING_ROOM_PRICE_ID;

let paddlePromise: Promise<Paddle | undefined> | null = null;

function getPaddle() {
  if (!paddlePromise) {
    paddlePromise = import("@paddle/paddle-js").then(({ initializePaddle }) =>
      initializePaddle({ token: CLIENT_TOKEN!, environment: ENVIRONMENT }),
    );
  }
  return paddlePromise;
}

export function ReadingRoomCheckoutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const [status, setStatus] = useState<"idle" | "opening" | "error">("idle");
  const configured = Boolean(CLIENT_TOKEN && PRICE_ID);

  async function openCheckout() {
    if (!configured) return;
    setStatus("opening");
    try {
      const paddle = await getPaddle();
      paddle?.Checkout.open({ items: [{ priceId: PRICE_ID!, quantity: 1 }] });
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button type="button" className={className} onClick={openCheckout} disabled={!configured || status === "opening"}>
        {status === "opening" ? "Opening…" : children}
      </button>
      {!configured ? (
        <p style={{ font: "var(--type-small)", color: "var(--ochre-100)", margin: "8px 0 0" }}>
          Checkout isn&rsquo;t configured yet — see CURRENT_STATE.md.
        </p>
      ) : null}
      {status === "error" ? (
        <p style={{ font: "var(--type-small)", color: "var(--status-critical)", margin: "8px 0 0" }}>
          Couldn&rsquo;t open checkout — please try again.
        </p>
      ) : null}
    </>
  );
}
