"use client";

import type { CSSProperties, ReactElement } from "react";

export type CoverProps = { active?: boolean; motionActive?: boolean };

const THEMES = {
  reaction: ["#0B3047", "#071420", "#57E4D1"],
  memory: ["#1A3850", "#091522", "#72E5D3"],
  focus: ["#117C75", "#064A50", "#FDE68A"],
  pattern: ["#C85B36", "#7C2E21", "#FFB36A"],
  word: ["#4A3A82", "#201A48", "#D0C1FF"],
  math: ["#F0C94B", "#E19A20", "#10223A"],
  stroop: ["#251B43", "#0D1024", "#F472B6"],
  spot: ["#315D81", "#142D49", "#8DDBD0"],
} as const;

function PreviewStage({ id, active, motionActive, children, label }: CoverProps & { id: keyof typeof THEMES; children: React.ReactNode; label: string }) {
  const [from, to, accent] = THEMES[id];
  return (
    <div
      className={`game-preview game-preview-${id} ${active ? "is-previewing" : ""} ${motionActive ? "is-motion-active" : ""}`}
      style={{ "--preview-from": from, "--preview-to": to, "--preview-accent": accent } as CSSProperties}
      aria-hidden="true"
    >
      <div className="game-preview-grid" />
      <div className="game-preview-glow" />
      <div className="game-preview-kicker"><i />{label}</div>
      <div className="game-preview-status">LIVE PREVIEW <i /></div>
      <div className="game-preview-scene">{children}</div>
      <div className="game-preview-depth" />
    </div>
  );
}

function ReactionCover(props: CoverProps) {
  return (
    <PreviewStage id="reaction" label="READY / SET / TAP" {...props}>
      <div className="reaction-streaks"><i /><i /><i /></div>
      <div className="reaction-target"><i /><b /><span /></div>
      <div className="reaction-cursor" />
      <div className="reaction-readout"><span>REACTION</span><strong>248</strong><b>MS</b></div>
    </PreviewStage>
  );
}

function MemoryCover(props: CoverProps) {
  return (
    <PreviewStage id="memory" label="REMEMBER THE ORDER" {...props}>
      <div className="memory-sequence"><span>01</span><i /><i /><i /><b>06</b></div>
      <div className="memory-tiles">
        {["#2DD4BF","#F5A623","#60A5FA","#9B72F2","#18B6A5","#F4753B"].map((color, i) => (
          <div key={color} className={`memory-tile memory-tile-${i + 1}`} style={{ "--tile-color": color, "--tile-offset": i % 2 ? "5px" : "0px", "--tile-lift": i % 2 ? "-2px" : "-7px", "--tile-delay": `${i * 115}ms` } as CSSProperties}><span>{i + 1}</span></div>
        ))}
      </div>
    </PreviewStage>
  );
}

function FocusCover(props: CoverProps) {
  return (
    <PreviewStage id="focus" label="FIND THE OUTLIER" {...props}>
      <div className="focus-preview-beam" />
      <div className="focus-preview-grid">
        {Array.from({ length: 20 }, (_, i) => <span key={i} className={i === 13 ? "is-target" : ""}>{i === 13 ? "Q" : "O"}</span>)}
      </div>
      <div className="focus-preview-lock"><i /><b /></div>
    </PreviewStage>
  );
}

function PatternCover(props: CoverProps) {
  return (
    <PreviewStage id="pattern" label="TRACE / RECALL" {...props}>
      <div className="pattern-phone">
        <div className="pattern-board">
          {Array.from({ length: 9 }, (_, i) => <i key={i} className={`pattern-dot dot-${i + 1}`} />)}
          {[1,2,3,4,5].map(i => <b key={i} className={`pattern-link link-${i}`} />)}
          <span className="pattern-finger" />
        </div>
      </div>
    </PreviewStage>
  );
}

function WordCover(props: CoverProps) {
  return (
    <PreviewStage id="word" label="FIND THE CONNECTION" {...props}>
      <div className="word-noise">{["Q","X","J","W","K","V","B","F","P"].map((l,i)=><i key={i} style={{ "--letter-x": `${4 + ((i * 37) % 90)}%`, "--letter-y": `${8 + (i % 4) * 24}%` } as CSSProperties}>{l}</i>)}</div>
      <div className="word-tray">
        {"DREAM".split("").map((letter,i)=><span key={letter} style={{ "--word-x": `${(i - 2) * 5}px`, "--word-y": `${i % 2 ? 5 : -4}px`, "--word-r": `${(i - 2) * 3}deg`, "--word-delay": `${i * 80}ms` } as CSSProperties}>{letter}</span>)}
      </div>
      <div className="word-thread" />
    </PreviewStage>
  );
}

function MathCover(props: CoverProps) {
  return (
    <PreviewStage id="math" label="BEAT THE CLOCK" {...props}>
      <div className="math-clock"><i /><strong>08</strong></div>
      <div className="math-card"><div className="math-flip"><span>8 × 7</span><b>?</b></div></div>
      <div className="math-answers"><span>54</span><span className="is-answer">56</span><span>63</span></div>
    </PreviewStage>
  );
}

function StroopCover(props: CoverProps) {
  return (
    <PreviewStage id="stroop" label="NAME THE INK" {...props}>
      <div className="stroop-orbs"><i /><i /><i /><i /></div>
      <div className="stroop-card"><div className="stroop-word"><span>RED</span><b>BLUE</b></div><i /></div>
      <div className="stroop-choices"><i /><i /><i /><i /></div>
    </PreviewStage>
  );
}

function MiniRoom({ changed }: { changed?: boolean }) {
  return (
    <div className={`spot-room ${changed ? "is-changed" : ""}`}>
      <i className="spot-sun" /><span className="spot-hills" /><b className="spot-chair" /><em className="spot-dot" />
    </div>
  );
}

function SpotCover(props: CoverProps) {
  return (
    <PreviewStage id="spot" label="SCAN EVERY DETAIL" {...props}>
      <div className="spot-scenes"><MiniRoom /><MiniRoom changed /></div>
      <div className="spot-divider" />
      <div className="spot-magnifier"><i /></div>
    </PreviewStage>
  );
}

export const COVERS: Record<string, (props: CoverProps) => ReactElement> = {
  reaction: ReactionCover,
  memory: MemoryCover,
  focus: FocusCover,
  pattern: PatternCover,
  word: WordCover,
  math: MathCover,
  stroop: StroopCover,
  spot: SpotCover,
};
