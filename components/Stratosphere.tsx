"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Stratosphere.module.css";

/**
 * The Animated Reader Request Stratosphere — homepage.md §1. Ported directly
 * from `Home.dc.html`'s bespoke layout logic (see
 * docs/design-specs/DESIGN_PROJECT_BUILD_NOTES.md: "the most fragile thing in
 * the project: it measures text, packs lanes, and recentres on resize. Don't
 * casually restyle"). Kept as a code-level constant per DECISIONS.md — this
 * copy changes rarely and isn't tied to any CMS publishing workflow.
 */
const REQUESTS = [
  "I want a book that will absolutely destroy me.",
  "What's the scariest book you've ever read?",
  "Give me the slowest slow burn imaginable.",
  "Any good adult coming-of-age books?",
  "I want a fantasy with a morally grey heroine.",
  "Something cosy for a rainy week off work.",
  "Looking for dark fantasy that actually gets dark.",
  "A romance where they're friends first, please.",
  "What should I read after a book hangover?",
  "I want a book that feels like autumn.",
  "Give me a villain I'll end up rooting for.",
  "Books to read when you can't focus on anything?",
  "I want to be scared, but not gross-scared.",
  "Something short I can finish in one sitting tonight.",
  "Books where the found family really feels like family?",
  "I need a heroine who is bad at being good.",
  "Something set somewhere cold and slightly haunted.",
  "A book my book club will argue about for hours.",
  "Recommend me a book that made you cry in public.",
  "I want to be furious on behalf of a woman.",
  "Anything with a big messy family at the centre?",
  "Looking for sci-fi that's more sad than technical.",
];

interface Slot {
  key: string;
  lane: number;
  text: string;
  size: number;
  face: string;
  weight: number;
  rest: number;
  left: number;
  top: number;
  cap: number;
  drift: string;
  dur: number;
  delay: number;
  on: boolean;
}

function rnd(i: number, salt: number) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const MIN_GAP = 44;
const INSET = 28;

export function Stratosphere() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLSpanElement | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const slotsRef = useRef<Slot[]>([]);
  slotsRef.current = slots;

  const cycleRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const swapRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const resizeRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const widthOf = useCallback((text: string, size: number, face: string, weight: number) => {
    const field = fieldRef.current;
    if (!field) return text.length * size * 0.5;
    if (!rulerRef.current || !rulerRef.current.isConnected) {
      const r = document.createElement("span");
      r.setAttribute("aria-hidden", "true");
      r.style.cssText = "position:absolute;left:-9999px;top:0;white-space:nowrap;visibility:hidden";
      field.appendChild(r);
      rulerRef.current = r;
    }
    rulerRef.current.style.font = `${weight || 400} ${size}px/1.35 ${face}`;
    rulerRef.current.textContent = text;
    return rulerRef.current.offsetWidth;
  }, []);

  const build = useCallback(() => {
    const field = fieldRef.current;
    if (!field) return;
    const W = field.clientWidth;
    const H = field.clientHeight;
    if (!W || !H) return;

    const lanes = Math.max(3, Math.floor(H / 32));
    const laneH = H / lanes;
    const pool = REQUESTS.map((_, i) => i).sort((a, b) => rnd(a, 3) - rnd(b, 3));
    const built: Slot[] = [];
    const spent: Record<number, boolean> = {};
    const perLane = W < 560 ? 2 : 6;

    for (let lane = 0; lane < lanes; lane++) {
      const picked: { idx: number; size: number; face: string; w: number; weight: number; rest: number }[] = [];
      let used = 0;
      for (let p = 0; p < pool.length; p++) {
        const idx = pool[p]!;
        if (spent[idx]) continue;
        if (picked.length >= perLane) break;
        const depth = rnd(idx, 4);
        const size = 12 + Math.round(depth * 2);
        const face = idx % 3 === 2 ? "var(--font-body)" : "var(--font-hand)";
        const weight = depth > 0.72 ? 700 : depth > 0.4 ? 600 : 400;
        const w = widthOf(REQUESTS[idx]!, size, face, weight);
        const gap = picked.length ? MIN_GAP : 0;
        const need = used + w + gap;
        if (need > W - 56) continue;
        picked.push({ idx, size, face, w, weight, rest: +(0.4 + depth * 0.6).toFixed(2) });
        spent[idx] = true;
        used = need;
      }
      if (!picked.length) continue;

      const usable = W - INSET * 2;
      const slack = Math.max(0, usable - used);
      const gaps = Math.max(1, picked.length - 1);
      const share = picked.length > 1 ? Math.min(slack / gaps, 34) : slack / 2;
      const advances = picked.map((it, k) => (k === 0 ? 0 : Math.max(MIN_GAP, share + (rnd(it.idx, 9) - 0.5) * share * 0.5)));
      const spanW = picked.reduce((s, it) => s + it.w, 0) + advances.reduce((s, a) => s + a, 0);
      let x = INSET + Math.max(0, (W - INSET * 2 - spanW) / 2);

      picked.forEach((it, k) => {
        x += advances[k]!;
        built.push({
          key: `slot-${lane}-${k}`,
          lane,
          text: REQUESTS[it.idx]!,
          size: it.size,
          face: it.face,
          weight: it.weight,
          rest: it.rest,
          left: Math.round(x),
          top: Math.round(lane * laneH + (laneH - 14 * 1.35) / 2),
          cap: it.w,
          drift: ["drift-a", "drift-b", "drift-c"][lane % 3]!,
          dur: 26 + Math.round(rnd(it.idx, 5) * 30),
          delay: -Math.round(rnd(it.idx, 6) * 12),
          on: true,
        });
        x += it.w;
      });
    }

    built.forEach((s, i) => {
      const next = built[i + 1];
      const sameLane = next && next.lane === s.lane;
      s.cap = sameLane ? Math.max(90, next.left - s.left - MIN_GAP) : Math.max(90, W - INSET - s.left);
    });

    setSlots(built);
    schedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widthOf]);

  const rejustify = useCallback(
    (list: Slot[], laneIdx: number) => {
      const field = fieldRef.current;
      if (!field) return list;
      const W = field.clientWidth;
      const next = list.map((s) => ({ ...s }));
      const lane = next.filter((s) => s.lane === laneIdx).sort((a, b) => a.left - b.left);
      const widths = lane.map((s) => widthOf(s.text, s.size, s.face, s.weight));
      const span = widths.reduce((a, b) => a + b, 0) + MIN_GAP * (lane.length - 1);
      let x = INSET + Math.max(0, (W - INSET * 2 - span) / 2);
      lane.forEach((s, k) => {
        if (k > 0) x += MIN_GAP;
        s.left = Math.round(x);
        x += widths[k]!;
      });
      lane.forEach((s, k) => {
        s.cap = k < lane.length - 1 ? Math.max(90, lane[k + 1]!.left - s.left - MIN_GAP) : Math.max(90, W - INSET - s.left);
      });
      return next;
    },
    [widthOf],
  );

  const turnOver = useCallback(() => {
    const current = slotsRef.current;
    if (!current.length) return;
    const candidates = current.map((s, i) => i).filter((i) => current[i]!.on);
    if (!candidates.length) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)]!;

    const fading = current.map((s, i) => (i === pick ? { ...s, on: false } : s));
    setSlots(fading);
    slotsRef.current = fading;

    swapRef.current = setTimeout(() => {
      const cur = slotsRef.current;
      const slot = cur[pick];
      if (!slot) return;
      const showing = cur.map((s) => s.text);
      const options = REQUESTS.filter((t) => showing.indexOf(t) < 0 && widthOf(t, slot.size, slot.face, slot.weight) <= slot.cap);
      const nextText = options.length ? options[Math.floor(Math.random() * options.length)]! : slot.text;
      const swapped = cur.map((s, i) => (i === pick ? { ...s, text: nextText, on: true } : s));
      const rejustified = rejustify(swapped, slot.lane);
      setSlots(rejustified);
      slotsRef.current = rejustified;
    }, 1400);
  }, [rejustify, widthOf]);

  function schedule() {
    if (cycleRef.current) clearInterval(cycleRef.current);
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    cycleRef.current = setInterval(turnOver, 2600);
  }

  useEffect(() => {
    const start = () => requestAnimationFrame(build);
    if (document.fonts?.ready) document.fonts.ready.then(start);
    else start();
    const fontTimer = setTimeout(start, 1200);

    const onResize = () => {
      if (resizeRef.current) clearTimeout(resizeRef.current);
      resizeRef.current = setTimeout(build, 220);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (cycleRef.current) clearInterval(cycleRef.current);
      if (swapRef.current) clearTimeout(swapRef.current);
      if (resizeRef.current) clearTimeout(resizeRef.current);
      clearTimeout(fontTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{ overflow: "hidden" }}>
      <div ref={fieldRef} className={styles.field}>
        {slots.map((s) => (
          <span
            key={s.key}
            className={styles.request}
            style={{
              left: s.left,
              top: s.top,
              font: `${s.weight || 400} ${s.size || 13}px/1.35 ${s.face}`,
              opacity: s.on ? (s.rest ?? 1) : 0,
              animation: `${s.drift} ${s.dur}s ${s.delay}s ease-in-out infinite alternate`,
            }}
          >
            {s.text}
          </span>
        ))}
      </div>
    </section>
  );
}
