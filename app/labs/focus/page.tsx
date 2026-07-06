"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Play } from "lucide-react";
import LiquidGlass from "@/components/labs/LiquidGlass";
import { LabShell, LabHero, StatTile, SciencePanel } from "@/components/labs/kit";

const ACCENT = "#DB2777";
const TRIALS = 8;
const PINGS = ["📱 new message", "🔔 3 notifications", "💬 they're typing…", "📸 tagged you", "🎮 friend online", "📧 new email"];

type Phase = "intro" | "run" | "between" | "done";

export default function FocusLab() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState<1 | 2>(1);
  const [target, setTarget] = useState<{ x: number; y: number; decoy: boolean } | null>(null);
  const [banners, setBanners] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  const [rt, setRt] = useState<{ r1: number[]; r2: number[] }>({ r1: [], r2: [] });
  const [misses, setMisses] = useState(0);

  const trialRef = useRef(0);
  const t0 = useRef(0);
  const timers = useRef<number[]>([]);
  const bannerId = useRef(0);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  const spawn = useCallback((noisy: boolean) => {
    const decoy = noisy && Math.random() < 0.3;
    setTarget({ x: 8 + Math.random() * 78, y: 12 + Math.random() * 62, decoy });
    t0.current = performance.now();
    // auto-miss if ignored
    timers.current.push(window.setTimeout(() => { setTarget(null); nextTrial(noisy, null, decoy); }, 1500));
  }, []);

  const nextTrial = useCallback((noisy: boolean, reaction: number | null, wasDecoy: boolean) => {
    clearTimers();
    if (reaction !== null && !wasDecoy) {
      setRt((p) => noisy ? { ...p, r2: [...p.r2, reaction] } : { ...p, r1: [...p.r1, reaction] });
    }
    trialRef.current += 1;
    if (trialRef.current >= TRIALS) {
      setTarget(null); setBanners([]);
      if (!noisy) { setRound(2); setPhase("between"); }
      else setPhase("done");
      return;
    }
    timers.current.push(window.setTimeout(() => spawn(noisy), 350 + Math.random() * 550));
  }, [spawn]);

  const startRound = (noisy: boolean) => {
    trialRef.current = 0;
    setMisses(0);
    setPhase("run");
    setRound(noisy ? 2 : 1);
    timers.current.push(window.setTimeout(() => spawn(noisy), 500));
    if (noisy) {
      const loop = () => {
        setBanners((b) => [...b.slice(-3), { id: bannerId.current++, text: PINGS[Math.floor(Math.random() * PINGS.length)], x: 6 + Math.random() * 60, y: 4 + Math.random() * 78 }]);
        timers.current.push(window.setTimeout(loop, 700 + Math.random() * 500));
      };
      timers.current.push(window.setTimeout(loop, 600));
    }
  };

  const hitTarget = (decoy: boolean) => {
    const reaction = performance.now() - t0.current;
    setTarget(null);
    if (decoy) { setMisses((m) => m + 1); nextTrial(round === 2, null, true); }
    else nextTrial(round === 2, reaction, false);
  };

  const avg = (a: number[]) => (a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0);
  const r1 = avg(rt.r1), r2 = avg(rt.r2);
  const cost = r1 && r2 ? r2 - r1 : 0;

  const reset = () => { clearTimers(); setPhase("intro"); setRound(1); setRt({ r1: [], r2: [] }); setMisses(0); setTarget(null); setBanners([]); };

  return (
    <LabShell lab="focus" badge={r1 ? { color: ACCENT, text: `${r1} ms clear` } : undefined}>
      <LabHero
        kicker="Focus Lab · Simulation 06"
        title="Feel the switch cost"
        subtitle="Two rounds of the same simple game: tap the dot the instant it appears. First in a clean room, then buried in notifications. Your own reaction times tell the story."
        accent={ACCENT}
      />

      <LiquidGlass radius={26} bezel={26} scale={52} style={{ padding: "20px" }}>
        {/* Play field */}
        <div
          className="lg-well relative overflow-hidden rounded-2xl select-none"
          style={{ height: 300, touchAction: "manipulation" }}
        >
          {phase === "intro" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-sm mb-4" style={{ color: "var(--ink-soft)", maxWidth: 340 }}>
                Round 1: a calm room. Tap each dot as fast as you can. Ignore the red ones later.
              </p>
              <button onClick={() => startRound(false)} className="lg-pill rounded-full font-semibold px-6 flex items-center gap-2" style={{ minHeight: 48, color: ACCENT }}>
                <Play className="w-4 h-4" /> Start round 1
              </button>
            </div>
          )}

          {phase === "between" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-faint)" }}>Round 1 done</p>
              <div className="text-3xl font-bold tabular-nums my-1" style={{ color: ACCENT }}>{r1} ms</div>
              <p className="text-sm mb-4" style={{ color: "var(--ink-soft)", maxWidth: 340 }}>
                Now round 2: same game, but your phone won't leave you alone. Tap green, never red.
              </p>
              <button onClick={() => startRound(true)} className="lg-pill rounded-full font-semibold px-6 flex items-center gap-2" style={{ minHeight: 48, color: ACCENT }}>
                <Play className="w-4 h-4" /> Bring the noise
              </button>
            </div>
          )}

          {phase === "run" && (
            <>
              {/* distractor banners */}
              {banners.map((b) => (
                <div key={b.id} className="absolute text-xs font-semibold rounded-lg pointer-events-none"
                  style={{ left: `${b.x}%`, top: `${b.y}%`, padding: "6px 10px", background: "rgba(255,255,255,0.9)", border: "1px solid rgba(11,26,43,0.1)", boxShadow: "0 6px 16px -6px rgba(20,30,60,0.3)", color: "var(--ink)", animation: "labFloatUp 0.25s ease both" }}>
                  {b.text}
                </div>
              ))}
              {/* target */}
              {target && (
                <button
                  onClick={() => hitTarget(target.decoy)}
                  aria-label={target.decoy ? "decoy, do not tap" : "tap target"}
                  className="absolute rounded-full"
                  style={{
                    left: `${target.x}%`, top: `${target.y}%`, width: 52, height: 52,
                    background: target.decoy ? "radial-gradient(circle at 35% 30%, #FCA5A1, #D8443B)" : "radial-gradient(circle at 35% 30%, #F9A8D4, #DB2777)",
                    boxShadow: `0 6px 18px -4px ${target.decoy ? "#D8443B" : ACCENT}aa`,
                    animation: "labPop 0.14s ease both",
                  }}
                />
              )}
              <div className="absolute bottom-2 left-3 text-xs font-semibold" style={{ color: "var(--ink-faint)" }}>
                {round === 2 ? "Round 2 · dodge red" : "Round 1"} · {trialRef.current}/{TRIALS}
              </div>
            </>
          )}

          {phase === "done" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-faint)" }}>The distraction tax</p>
              <div className="text-4xl font-bold tabular-nums my-1" style={{ color: cost > 0 ? "#D8443B" : "#0E8A7D" }}>
                {cost > 0 ? `+${cost}` : cost} ms
              </div>
              <p className="text-sm" style={{ color: "var(--ink-soft)", maxWidth: 360 }}>
                Clean: <b>{r1} ms</b>. Noisy: <b>{r2} ms</b>. {misses > 0 && <>You also tapped <b>{misses}</b> wrong. </>}
                Same task, slower and sloppier, just from stuff pulling at your attention.
              </p>
            </div>
          )}
        </div>

        {(phase === "done") && (
          <button onClick={reset} className="mt-4 w-full lg-pill rounded-full font-semibold" style={{ minHeight: 48, color: ACCENT }}>
            Play again
          </button>
        )}
      </LiquidGlass>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <StatTile value="23 min" label="to fully return to a task after a real interruption" accent={ACCENT} />
        <StatTile value="40%" label="more time to finish when you switch between tasks" accent={ACCENT} />
        <StatTile value="0" label="people who truly multitask, your brain switches" accent={ACCENT} />
      </div>

      <SciencePanel
        accent={ACCENT}
        intro="Your brain doesn't run two thinking tasks at once. It switches, fast, and each switch leaves 'attention residue': part of your focus stuck on the thing you just left. You just felt it as slower, messier taps under the same simple rules."
        points={[
          { text: "After an interruption, people take an average of about 23 minutes to fully return to the original task", cite: "Mark et al., CHI 2008" },
          { text: "Switching between tasks can add up to ~40% more time to finish them versus one at a time", cite: "Rubinstein, Meyer & Evans, J Exp Psychol 2001" },
          { text: "Leftover 'attention residue' from the last task measurably lowers performance on the next", cite: "Leroy, Org Behav Hum Decis Process 2009" },
        ]}
      />
    </LabShell>
  );
}
