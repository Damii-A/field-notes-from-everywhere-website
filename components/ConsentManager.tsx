"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ds/Button";
import styles from "./ConsentManager.module.css";
import { OPEN_COOKIE_SETTINGS_EVENT, clearAnalyticsCookies, readConsent, writeConsent, type ConsentChoice } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

/**
 * Google Analytics behind a consent banner (DECISIONS.md, 2026-09-26). Not in
 * the design: required once the site uses analytics cookies.
 *
 * Nothing from Google loads until analytics is allowed. A stored choice
 * (lib/consent.ts) is applied as-is. With no choice yet, /api/geo says
 * whether this visitor must opt in (EEA, UK, Switzerland): if so the banner
 * asks and analytics waits; elsewhere analytics runs by default and the
 * banner stays hidden. The footer's "Cookie settings" reopens the banner for
 * anyone. The script loads once the page is idle, so it never competes with
 * the page's own loading.
 */
export function ConsentManager({ gaId }: { gaId?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ConsentChoice | null>(null);

  const enableAnalytics = useCallback(() => {
    if (!gaId) return;
    window[`ga-disable-${gaId}`] = false;
    if (window.gtag) return; // already loaded
    whenIdle(() => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // gtag.js expects the arguments object itself, not an array.
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", gaId);
      const s = document.createElement("script");
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(s);
    });
  }, [gaId]);

  const disableAnalytics = useCallback(() => {
    if (gaId) window[`ga-disable-${gaId}`] = true;
    clearAnalyticsCookies();
  }, [gaId]);

  useEffect(() => {
    if (!gaId) return; // no analytics configured: nothing to ask about
    if (location.pathname.startsWith("/studio")) return; // editors, not readers
    const stored = readConsent();
    setCurrent(stored);
    if (stored) {
      if (stored.analytics) enableAnalytics();
      return;
    }
    let cancelled = false;
    fetch("/api/geo")
      .then((r) => r.json() as Promise<{ consentRequired: boolean }>)
      .catch(() => ({ consentRequired: true }))
      .then(({ consentRequired }) => {
        if (cancelled) return;
        if (consentRequired) setOpen(true);
        else enableAnalytics();
      });
    return () => {
      cancelled = true;
    };
  }, [gaId, enableAnalytics]);

  useEffect(() => {
    if (!gaId) return;
    const reopen = () => {
      setCurrent(readConsent());
      setOpen(true);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, [gaId]);

  function choose(analytics: boolean) {
    const choice = { analytics };
    writeConsent(choice);
    setCurrent(choice);
    setOpen(false);
    if (analytics) enableAnalytics();
    else disableAnalytics();
  }

  if (!open || pathname.startsWith("/studio")) return null;

  return (
    <section className={styles.banner} role="dialog" aria-labelledby="consent-title" aria-describedby="consent-text">
      <h2 id="consent-title" className={styles.title}>
        Cookies
      </h2>
      <p id="consent-text" className={styles.text}>
        We&rsquo;d like to use analytics cookies (Google Analytics) to see which reading lists people find useful, so we
        can make the site better. They&rsquo;re only set if you accept.{" "}
        <Link href="/privacy-and-cookies" className={styles.link}>
          Privacy &amp; Cookies
        </Link>
      </p>
      {current && (
        <p className={styles.current}>Analytics cookies are currently {current.analytics ? "on" : "off"}.</p>
      )}
      <div className={styles.actions}>
        <Button tone="primary" size="md" onClick={() => choose(true)}>
          accept
        </Button>
        <Button tone="secondary" size="md" onClick={() => choose(false)}>
          decline
        </Button>
      </div>
    </section>
  );
}

function whenIdle(fn: () => void) {
  const run = () => ("requestIdleCallback" in window ? window.requestIdleCallback(fn, { timeout: 3000 }) : setTimeout(fn, 1));
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
}
