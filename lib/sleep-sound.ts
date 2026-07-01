"use client";

// Tiny Web Audio sound kit for the Sleep Lab — no asset files, all synthesised.
// Minimal, Apple-UI-ish: soft clicks, gentle whooshes, satisfying dings.

import { useSyncExternalStore } from "react";

type SoundName = "click" | "tick" | "whoosh" | "ding" | "fail";

let ctx: AudioContext | null = null;
let muted = false;
let hydrated = false;
const listeners = new Set<() => void>();

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    muted = window.localStorage.getItem("sleepLabMuted") === "1";
  } catch {
    /* ignore */
  }
}

export function isMuted(): boolean {
  hydrate();
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    window.localStorage.setItem("sleepLabMuted", value ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** React hook — mute state, kept in sync across every component. */
export function useMuted(): boolean {
  return useSyncExternalStore(subscribe, isMuted, () => false);
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain: number,
  delay = 0,
  slideTo?: number,
): void {
  const c = ensureCtx();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

export function playSound(name: SoundName): void {
  if (isMuted()) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  switch (name) {
    case "click":
      tone(430, 0.05, "sine", 0.1);
      break;
    case "tick":
      tone(840, 0.025, "triangle", 0.045);
      break;
    case "whoosh":
      tone(260, 0.2, "sine", 0.06, 0, 540);
      break;
    case "ding":
      tone(660, 0.16, "sine", 0.12);
      tone(988, 0.32, "sine", 0.1, 0.06);
      break;
    case "fail":
      tone(220, 0.26, "sine", 0.11, 0, 130);
      break;
  }
}
