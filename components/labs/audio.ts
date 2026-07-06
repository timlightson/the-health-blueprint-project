"use client";

// Tiny Web Audio engine shared by the Sound Lab. One AudioContext, created on
// the first user gesture (browsers require that), reused after.

let ctx: AudioContext | null = null;

export function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export interface Tone {
  stop: () => void;
  setFreq: (hz: number) => void;
  setPan: (p: number) => void;
}

/** Start a sine tone with a gentle attack. Returns handles to steer/stop it. */
export function playTone(freq: number, gain = 0.12, pan = 0): Tone | null {
  const ac = getCtx();
  if (!ac) return null;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const panner = ac.createStereoPanner ? ac.createStereoPanner() : null;

  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + 0.04);

  osc.connect(g);
  if (panner) {
    panner.pan.value = pan;
    g.connect(panner);
    panner.connect(ac.destination);
  } else {
    g.connect(ac.destination);
  }
  osc.start();

  return {
    stop: () => {
      const t = ac.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 0.05);
      osc.stop(t + 0.08);
    },
    setFreq: (hz: number) => {
      osc.frequency.setTargetAtTime(hz, ac.currentTime, 0.02);
    },
    setPan: (p: number) => {
      if (panner) panner.pan.setTargetAtTime(p, ac.currentTime, 0.02);
    },
  };
}

/** One short beep, self-stopping. Used for the left/right channel check. */
export function beep(freq: number, ms = 700, gain = 0.14, pan = 0) {
  const t = playTone(freq, gain, pan);
  if (t) window.setTimeout(() => t.stop(), ms);
  return t;
}

export const fmtHz = (hz: number) => (hz >= 1000 ? `${(hz / 1000).toFixed(hz % 1000 === 0 ? 0 : 1)} kHz` : `${Math.round(hz)} Hz`);
