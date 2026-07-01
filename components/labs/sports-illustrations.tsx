// Crafted, layered sport scenes for the grid. One unified system across all 16:
//
//   1. a theme-colored background gradient with tonal depth and a top-right glow
//   2. a low-opacity mid-layer of context (ground, water, court, lanes, net)
//   3. a crisp near-white subject caught mid-motion, off-center, bleeding to the
//      top and edges, always with a trail or speed lines so the tile feels alive
//
// Consistent line weight, rounded caps and joins, light from the upper right.
// Each tile fills its frame and reads at mobile size; the subject sits in the
// upper art area so the bottom-left glass pill never hides it.

import type { ReactElement } from "react";

const W = "#F8FAFF";       // crisp near-white subject
const FRAME = {
  viewBox: "0 0 400 300",
  preserveAspectRatio: "xMidYMid slice" as const,
  style: { width: "100%", height: "100%", display: "block" as const },
};

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { const a = 1 + amt; r *= a; g *= a; b *= a; }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

function Frame({ theme, children }: { theme: string; children: ReactElement }) {
  const uid = theme.replace("#", "");
  return (
    <svg {...FRAME} aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={shade(theme, 0.3)} />
          <stop offset="0.52" stopColor={theme} />
          <stop offset="1" stopColor={shade(theme, -0.36)} />
        </linearGradient>
        <radialGradient id={`glow-${uid}`} cx="0.74" cy="0.16" r="0.95">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.24" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#bg-${uid})`} />
      <rect width="400" height="300" fill={`url(#glow-${uid})`} />
      {children}
    </svg>
  );
}

// Shared stroke presets for the white subjects.
const S = { stroke: W, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const SPORT_ART: Record<string, (p: { theme: string }) => ReactElement> = {
  // ── Track: runner exploding from the blocks, lanes sweeping in perspective ──
  track: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M -30 ${300 - i * 6} Q 150 ${236 - i * 20} 430 ${150 - i * 26}`} {...S} strokeWidth="7" opacity={0.2 - i * 0.025} />
        ))}
        <path d="M120 244 l34 -16 6 14 -34 16 z" fill={W} opacity="0.5" />
        {/* speed lines */}
        {[150, 168, 186].map((y, i) => <line key={y} x1={70 - i * 14} y1={y} x2={140 - i * 8} y2={y} {...S} strokeWidth="6" opacity={0.32 - i * 0.07} />)}
        {/* ghost trail */}
        <g transform="rotate(-17 232 168)" opacity="0.16">
          <line x1="206" y1="96" x2="200" y2="160" {...S} strokeWidth="14" />
          <line x1="200" y1="160" x2="232" y2="214" {...S} strokeWidth="13" />
        </g>
        {/* runner */}
        <g transform="rotate(-17 246 168)">
          <circle cx="248" cy="62" r="15" fill={W} />
          <line x1="244" y1="80" x2="236" y2="162" {...S} strokeWidth="15" />
          <line x1="240" y1="104" x2="292" y2="120" {...S} strokeWidth="11" />
          <line x1="240" y1="104" x2="198" y2="84" {...S} strokeWidth="11" />
          <line x1="236" y1="162" x2="280" y2="196" {...S} strokeWidth="14" />
          <line x1="280" y1="196" x2="300" y2="232" {...S} strokeWidth="12" />
          <line x1="236" y1="162" x2="196" y2="206" {...S} strokeWidth="14" />
          <line x1="196" y1="206" x2="214" y2="240" {...S} strokeWidth="12" />
        </g>
      </g>
    </Frame>
  ),

  // ── Swimming: freestyle stroke, arm up, splash, lane ropes, ripples ──
  swimming: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        {[96, 132, 168].map((y, i) => (
          <g key={y} opacity={0.16 - i * 0.03}>
            {[0, 60, 120, 180, 240, 300, 360].map((x) => <circle key={x} cx={x + (i % 2) * 24} cy={y} r="6" fill={W} />)}
          </g>
        ))}
        {[210, 244, 278].map((y, i) => <path key={y} d={`M -20 ${y} q 50 -16 100 0 t 100 0 t 100 0 t 100 0`} {...S} strokeWidth="6" opacity={0.22 - i * 0.05} />)}
        {/* water surface the swimmer cuts */}
        <path d="M40 178 q120 -34 320 4" {...S} strokeWidth="7" opacity="0.3" />
        {/* swimmer, diagonal, recovery arm up */}
        <g>
          <line x1="120" y1="196" x2="270" y2="150" {...S} strokeWidth="20" />
          <circle cx="282" cy="150" r="16" fill={W} />
          <line x1="210" y1="172" x2="176" y2="96" {...S} strokeWidth="13" />
          <line x1="176" y1="96" x2="206" y2="74" {...S} strokeWidth="12" />
          <line x1="128" y1="194" x2="92" y2="226" {...S} strokeWidth="13" />
        </g>
        {/* splash */}
        {[[214, 70], [228, 60], [240, 78], [200, 64]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5 - i * 0.6} fill={W} opacity="0.85" />)}
        {[88, 100, 110].map((x, i) => <circle key={x} cx={x} cy={230 - i * 4} r={4 - i} fill={W} opacity="0.7" />)}
      </g>
    </Frame>
  ),

  // ── Rowing: a single shell cutting water, oars mid-pull, a trailing wake ──
  rowing: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        {/* wake diverging behind */}
        <path d="M70 196 Q -10 150 -40 96" {...S} strokeWidth="6" opacity="0.2" />
        <path d="M70 196 Q -10 244 -30 300" {...S} strokeWidth="6" opacity="0.2" />
        {[210, 240, 270].map((y, i) => <path key={y} d={`M -20 ${y} q 60 -12 120 0 t 120 0 t 120 0`} {...S} strokeWidth="5" opacity={0.16 - i * 0.04} />)}
        {/* shell */}
        <path d="M60 196 Q 240 168 392 188 Q 240 206 60 196 Z" fill={W} opacity="0.95" />
        <line x1="392" y1="188" x2="378" y2="178" {...S} strokeWidth="7" opacity="0.6" />
        {/* oars mid-pull */}
        <line x1="150" y1="190" x2="96" y2="120" {...S} strokeWidth="8" opacity="0.85" />
        <line x1="220" y1="188" x2="288" y2="124" {...S} strokeWidth="8" opacity="0.85" />
        <ellipse cx="88" cy="112" rx="16" ry="8" transform="rotate(-38 88 112)" fill={W} opacity="0.8" />
        <ellipse cx="298" cy="116" rx="16" ry="8" transform="rotate(38 298 116)" fill={W} opacity="0.8" />
        {/* rower */}
        <circle cx="186" cy="150" r="13" fill={W} />
        <line x1="186" y1="164" x2="186" y2="190" {...S} strokeWidth="14" />
        <line x1="186" y1="172" x2="150" y2="186" {...S} strokeWidth="9" />
        <line x1="186" y1="172" x2="222" y2="184" {...S} strokeWidth="9" />
        {/* splash at blades */}
        {[[84, 100], [300, 104]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill={W} opacity="0.8" />)}
      </g>
    </Frame>
  ),

  // ── Cross Country: a lone runner on a rolling trail, low horizon, long road ──
  crosscountry: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        <circle cx="320" cy="62" r="34" fill={W} opacity="0.5" />
        <path d="M-20 168 Q 90 138 200 162 Q 300 182 420 150" {...S} strokeWidth="5" opacity="0.28" />
        <path d="M-20 300 L-20 196 Q 110 150 230 192 Q 330 226 420 178 L420 300 Z" fill={W} opacity="0.12" />
        <path d="M-20 300 L-20 238 Q 130 200 250 234 Q 340 260 420 222 L420 300 Z" fill={W} opacity="0.18" />
        {/* receding trail */}
        <path d="M150 300 Q 196 250 224 224 Q 252 198 300 186" {...S} strokeWidth="14" opacity="0.22" />
        <path d="M150 300 Q 196 250 224 224 Q 252 198 300 186" {...S} strokeWidth="4" strokeDasharray="2 12" opacity="0.5" />
        {/* runner on the trail */}
        <g transform="rotate(-8 196 196)">
          <circle cx="196" cy="120" r="13" fill={W} />
          <line x1="194" y1="134" x2="188" y2="196" {...S} strokeWidth="13" />
          <line x1="190" y1="154" x2="224" y2="166" {...S} strokeWidth="9" />
          <line x1="190" y1="154" x2="158" y2="140" {...S} strokeWidth="9" />
          <line x1="188" y1="196" x2="216" y2="230" {...S} strokeWidth="12" />
          <line x1="188" y1="196" x2="160" y2="232" {...S} strokeWidth="12" />
        </g>
      </g>
    </Frame>
  ),

  // ── Cycling: leaned hard into a turn, motion-blurred wheels, speed lines ──
  cycling: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        {[150, 176, 202].map((y, i) => <line key={y} x1={-10} y1={y} x2={120 - i * 20} y2={y} {...S} strokeWidth="6" opacity={0.3 - i * 0.07} />)}
        <line x1="-10" y1="262" x2="420" y2="244" {...S} strokeWidth="4" opacity="0.18" />
        <g transform="rotate(14 230 200)">
          {/* wheels with motion blur arcs */}
          <circle cx="148" cy="214" r="50" {...S} strokeWidth="8" />
          <circle cx="300" cy="206" r="50" {...S} strokeWidth="8" />
          {[0.5, 0.3, 0.15].map((o, i) => <path key={i} d={`M ${108 - i * 8} 214 a 50 50 0 0 1 ${20 + i * 4} -36`} {...S} strokeWidth="6" opacity={o} />)}
          {[0.5, 0.3, 0.15].map((o, i) => <path key={`b${i}`} d={`M ${260 - i * 8} 206 a 50 50 0 0 1 ${20 + i * 4} -36`} {...S} strokeWidth="6" opacity={o} />)}
          {/* frame */}
          <path d="M148 214 L224 214 L196 138 L148 214 M224 214 L268 142 L300 206 M196 138 L276 138" {...S} strokeWidth="8" />
          <line x1="276" y1="138" x2="296" y2="120" {...S} strokeWidth="8" />
          {/* rider */}
          <circle cx="226" cy="98" r="13" fill={W} />
          <line x1="222" y1="110" x2="210" y2="146" {...S} strokeWidth="13" />
          <line x1="214" y1="128" x2="282" y2="130" {...S} strokeWidth="10" />
          <line x1="210" y1="146" x2="224" y2="200" {...S} strokeWidth="11" />
        </g>
      </g>
    </Frame>
  ),

  // ── Weightlifting: barbell locked out overhead, bar bending, braced lifter ──
  weightlifting: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        <ellipse cx="200" cy="70" rx="150" ry="40" fill="#ffffff" opacity="0.10" />
        <line x1="40" y1="276" x2="360" y2="276" {...S} strokeWidth="6" opacity="0.2" />
        {/* strain lines */}
        {[[150, 150], [250, 150]].map(([x, y], i) => <g key={i} opacity="0.35">{[-1, 0, 1].map((k) => <line key={k} x1={x + k * 12} y1={y - 6} x2={x + k * 12} y2={y - 22} {...S} strokeWidth="4" />)}</g>)}
        {/* bar, bending under load */}
        <path d="M58 96 Q 200 116 342 96" {...S} strokeWidth="9" />
        <rect x="50" y="64" width="20" height="74" rx="8" fill={W} />
        <rect x="74" y="78" width="15" height="48" rx="6" fill={W} opacity="0.75" />
        <rect x="330" y="64" width="20" height="74" rx="8" fill={W} />
        <rect x="311" y="78" width="15" height="48" rx="6" fill={W} opacity="0.75" />
        {/* lifter, braced */}
        <circle cx="200" cy="150" r="15" fill={W} />
        <line x1="200" y1="128" x2="158" y2="106" {...S} strokeWidth="13" />
        <line x1="200" y1="128" x2="242" y2="106" {...S} strokeWidth="13" />
        <line x1="200" y1="166" x2="200" y2="228" {...S} strokeWidth="16" />
        <line x1="200" y1="228" x2="170" y2="276" {...S} strokeWidth="14" />
        <line x1="200" y1="228" x2="230" y2="276" {...S} strokeWidth="14" />
      </g>
    </Frame>
  ),

  // ── Gymnastics: mid-air, a clean curved body line, a flip arc, chalk ──
  gymnastics: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        <path d="M40 250 Q 150 60 360 120" {...S} strokeWidth="5" strokeDasharray="2 14" opacity="0.4" />
        <path d="M40 250 Q 150 60 360 120" {...S} strokeWidth="20" opacity="0.1" />
        <line x1="40" y1="280" x2="360" y2="280" {...S} strokeWidth="6" opacity="0.2" />
        {/* chalk specks */}
        {[[120, 96], [134, 110], [150, 90], [110, 112], [300, 130]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3 - i * 0.3} fill={W} opacity="0.55" />)}
        {/* gymnast, arched mid-flip */}
        <g transform="rotate(-26 196 130)">
          <circle cx="158" cy="118" r="14" fill={W} />
          <path d="M168 124 Q 210 96 252 128" {...S} strokeWidth="16" />
          <line x1="170" y1="126" x2="138" y2="100" {...S} strokeWidth="11" />
          <line x1="138" y1="100" x2="120" y2="118" {...S} strokeWidth="10" />
          <line x1="250" y1="126" x2="288" y2="108" {...S} strokeWidth="12" />
          <line x1="288" y1="108" x2="312" y2="128" {...S} strokeWidth="11" />
        </g>
      </g>
    </Frame>
  ),

  // ── Soccer: a ball mid-strike curving toward the corner of the net, a boot ──
  soccer: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        {/* goal net at upper right */}
        <g opacity="0.22">
          <rect x="262" y="40" width="120" height="120" rx="4" {...S} strokeWidth="5" />
          {[286, 310, 334, 358].map((x) => <line key={x} x1={x} y1="40" x2={x} y2="160" {...S} strokeWidth="2.5" />)}
          {[64, 88, 112, 136].map((y) => <line key={y} x1="262" y1={y} x2="382" y2={y} {...S} strokeWidth="2.5" />)}
        </g>
        <line x1="-20" y1="252" x2="420" y2="234" {...S} strokeWidth="5" opacity="0.2" />
        {/* curved flight trail */}
        <path d="M96 232 Q 200 96 318 96" {...S} strokeWidth="5" strokeDasharray="2 12" opacity="0.6" />
        <path d="M96 232 Q 200 96 318 96" {...S} strokeWidth="16" opacity="0.1" />
        {/* boot just off the ball */}
        <path d="M52 244 q40 -10 64 6 q-6 22 -38 18 q-26 -2 -26 -24 z" fill={W} opacity="0.9" />
        {/* ball mid-flight */}
        <circle cx="128" cy="208" r="26" fill={W} />
        <path d="M128 184 l16 12 -6 19 -20 0 -6 -19 z" fill={theme} />
        {[[128, 184], [144, 196], [138, 215], [118, 215], [112, 196]].map(([x, y], i) => <line key={i} x1="128" y1="208" x2={x} y2={y} stroke={theme} strokeWidth="2.5" opacity="0.5" />)}
        {/* impact spark */}
        {[[100, 224], [96, 208], [104, 240]].map(([x, y], i) => <line key={`s${i}`} x1="118" y1="216" x2={x} y2={y} {...S} strokeWidth="3" opacity="0.6" />)}
      </g>
    </Frame>
  ),

  // ── Basketball: a ball arcing into the hoop and net, backboard behind ──
  basketball: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        {/* backboard + rim */}
        <g opacity="0.55">
          <rect x="286" y="44" width="92" height="64" rx="5" {...S} strokeWidth="5" />
          <rect x="316" y="74" width="32" height="22" rx="3" {...S} strokeWidth="4" />
        </g>
        <path d="M286 120 q24 14 54 0" {...S} strokeWidth="7" opacity="0.9" />
        {/* net */}
        <g opacity="0.6">{[290, 302, 314, 326, 338].map((x, i) => <line key={x} x1={x} y1="124" x2={300 + i * 8} y2="158" {...S} strokeWidth="3" />)}</g>
        <line x1="-10" y1="264" x2="420" y2="248" {...S} strokeWidth="5" opacity="0.18" />
        {/* trajectory arc */}
        <path d="M86 250 Q 150 70 300 110" {...S} strokeWidth="5" strokeDasharray="2 12" opacity="0.55" />
        <path d="M86 250 Q 150 70 300 110" {...S} strokeWidth="16" opacity="0.1" />
        {/* ball on the arc */}
        <circle cx="150" cy="150" r="30" fill={W} />
        <line x1="150" y1="120" x2="150" y2="180" stroke={theme} strokeWidth="3.5" />
        <line x1="120" y1="150" x2="180" y2="150" stroke={theme} strokeWidth="3.5" />
        <path d="M126 128 Q 150 150 126 172" {...{ stroke: theme, fill: "none" }} strokeWidth="3.5" />
        <path d="M174 128 Q 150 150 174 172" {...{ stroke: theme, fill: "none" }} strokeWidth="3.5" />
      </g>
    </Frame>
  ),

  // ── American Football: a spiral mid-flight, a player throwing, yard lines ──
  football: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        {[300, 256, 212, 168].map((x, i) => <line key={x} x1={x} y1="300" x2={x + 70 - i * 6} y2="186" {...S} strokeWidth="5" opacity={0.2 - i * 0.03} />)}
        <line x1="-20" y1="186" x2="420" y2="186" {...S} strokeWidth="4" opacity="0.18" />
        {/* flight arc */}
        <path d="M120 196 Q 240 92 360 120" {...S} strokeWidth="5" strokeDasharray="2 12" opacity="0.55" />
        {/* spinning ball */}
        <g transform="rotate(-24 300 120)">
          <ellipse cx="300" cy="120" rx="40" ry="22" fill={W} />
          <line x1="270" y1="120" x2="330" y2="120" stroke={theme} strokeWidth="3.5" opacity="0.6" />
          {[290, 300, 310].map((x) => <line key={x} x1={x} y1="113" x2={x} y2="127" stroke={theme} strokeWidth="3.5" />)}
          <path d="M264 104 q-14 16 0 32" {...S} strokeWidth="4" opacity="0.45" />
        </g>
        {/* thrower */}
        <g>
          <circle cx="120" cy="118" r="14" fill={W} />
          <line x1="118" y1="132" x2="112" y2="196" {...S} strokeWidth="15" />
          <line x1="116" y1="150" x2="154" y2="126" {...S} strokeWidth="11" />
          <line x1="116" y1="150" x2="88" y2="172" {...S} strokeWidth="11" />
          <line x1="112" y1="196" x2="142" y2="232" {...S} strokeWidth="13" />
          <line x1="112" y1="196" x2="86" y2="234" {...S} strokeWidth="13" />
        </g>
      </g>
    </Frame>
  ),

  // ── Ice Hockey: a puck off a slapshot, stick blade, ice spray, streaks ──
  hockey: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        <ellipse cx="200" cy="252" rx="220" ry="50" fill="#ffffff" opacity="0.1" />
        <path d="M-20 234 Q 200 214 420 238" {...S} strokeWidth="5" opacity="0.2" />
        {/* motion streaks */}
        {[150, 168, 186].map((y, i) => <line key={y} x1={120 - i * 18} y1={y} x2={300 - i * 10} y2={y - 8} {...S} strokeWidth="6" opacity={0.4 - i * 0.1} />)}
        {/* puck flying */}
        <ellipse cx="320" cy="150" rx="34" ry="13" fill={W} />
        <ellipse cx="290" cy="156" rx="30" ry="11" fill={W} opacity="0.4" />
        <ellipse cx="262" cy="162" rx="26" ry="9" fill={W} opacity="0.2" />
        {/* stick + blade */}
        <line x1="70" y1="96" x2="150" y2="206" {...S} strokeWidth="11" />
        <path d="M150 206 q34 8 54 -4" {...S} strokeWidth="14" />
        {/* ice spray */}
        {[[150, 220], [138, 232], [166, 230], [128, 218], [180, 224]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5 - i * 0.6} fill={W} opacity="0.8" />)}
      </g>
    </Frame>
  ),

  // ── Lacrosse: a shot, the ball leaving the stick pocket along a trail to net ──
  lacrosse: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        <g opacity="0.22">
          <rect x="286" y="60" width="98" height="98" rx="4" {...S} strokeWidth="5" />
          {[310, 334, 358].map((x) => <line key={x} x1={x} y1="60" x2={x} y2="158" {...S} strokeWidth="2.5" />)}
          {[84, 108, 132].map((y) => <line key={y} x1="286" y1={y} x2="384" y2={y} {...S} strokeWidth="2.5" />)}
        </g>
        <line x1="-20" y1="256" x2="420" y2="240" {...S} strokeWidth="5" opacity="0.18" />
        {/* shot trail */}
        <path d="M150 150 Q 240 96 330 110" {...S} strokeWidth="5" strokeDasharray="2 12" opacity="0.6" />
        {/* stick: shaft + head pocket */}
        <line x1="96" y1="248" x2="158" y2="120" {...S} strokeWidth="10" />
        <path d="M158 120 q30 -18 44 12 q-16 26 -50 14" {...S} strokeWidth="8" />
        <path d="M166 122 l28 12 M170 134 l26 6" {...S} strokeWidth="2.5" opacity="0.5" />
        {/* ball leaving */}
        <circle cx="232" cy="120" r="15" fill={W} />
        <circle cx="206" cy="128" r="11" fill={W} opacity="0.35" />
      </g>
    </Frame>
  ),

  // ── Tennis: racket mid-swing meeting the ball, ball compressing, swing arc ──
  tennis: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        <line x1="-20" y1="248" x2="420" y2="232" {...S} strokeWidth="5" opacity="0.18" />
        <g opacity="0.16">{[40, 200, 360].map((x) => <line key={x} x1={x} y1="232" x2={x - 30} y2="300" {...S} strokeWidth="3" />)}</g>
        {/* swing arc */}
        <path d="M70 86 Q 120 250 286 214" {...S} strokeWidth="5" strokeDasharray="2 12" opacity="0.5" />
        <path d="M70 86 Q 120 250 286 214" {...S} strokeWidth="18" opacity="0.08" />
        {/* racket */}
        <g transform="rotate(28 196 150)">
          <ellipse cx="196" cy="120" rx="52" ry="66" {...S} strokeWidth="11" />
          <line x1="196" y1="186" x2="196" y2="250" {...S} strokeWidth="13" />
          <g stroke={W} strokeWidth="2" opacity="0.45">
            {[172, 196, 220].map((x) => <line key={x} x1={x} y1="62" x2={x} y2="178" />)}
            {[96, 120, 144].map((y) => <line key={y} x1="148" y1={y} x2="244" y2={y} />)}
          </g>
        </g>
        {/* ball compressing at contact */}
        <ellipse cx="276" cy="120" rx="30" ry="24" fill={W} />
        <path d="M252 108 q24 12 48 0" {...{ stroke: theme, fill: "none" }} strokeWidth="3" />
        {[[306, 104], [312, 122], [304, 140]].map(([x, y], i) => <line key={i} x1="298" y1="120" x2={x} y2={y} {...S} strokeWidth="3" opacity="0.6" />)}
      </g>
    </Frame>
  ),

  // ── Volleyball: a player rising above the net for a spike, ball about to hit ──
  volleyball: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        {/* net */}
        <line x1="-20" y1="170" x2="420" y2="170" {...S} strokeWidth="6" opacity="0.5" />
        <g opacity="0.3">{Array.from({ length: 14 }, (_, i) => <line key={i} x1={i * 30} y1="158" x2={i * 30} y2="182" {...S} strokeWidth="2.5" />)}</g>
        {/* jump arc */}
        <path d="M60 250 Q 120 110 200 132" {...S} strokeWidth="5" strokeDasharray="2 12" opacity="0.5" />
        {/* player rising, arm up to spike */}
        <g transform="rotate(-10 168 170)">
          <circle cx="158" cy="120" r="14" fill={W} />
          <line x1="160" y1="134" x2="166" y2="206" {...S} strokeWidth="14" />
          <line x1="162" y1="150" x2="206" y2="92" {...S} strokeWidth="11" />
          <line x1="162" y1="150" x2="128" y2="118" {...S} strokeWidth="11" />
          <line x1="166" y1="206" x2="150" y2="252" {...S} strokeWidth="13" />
          <line x1="166" y1="206" x2="192" y2="248" {...S} strokeWidth="13" />
        </g>
        {/* ball above the hand */}
        <circle cx="226" cy="74" r="28" fill={W} />
        <path d="M198 74 q28 -16 56 0" {...{ stroke: theme, fill: "none" }} strokeWidth="3.5" />
        <path d="M210 52 q16 28 0 44" {...{ stroke: theme, fill: "none" }} strokeWidth="3.5" />
        <path d="M242 52 q-16 28 0 44" {...{ stroke: theme, fill: "none" }} strokeWidth="3.5" />
      </g>
    </Frame>
  ),

  // ── Baseball / Softball: a bat connecting with the ball, contact spark, arc ──
  baseball: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        <path d="M150 286 l44 -16 44 16 -44 16 z" fill={W} opacity="0.16" />
        <line x1="-20" y1="262" x2="420" y2="246" {...S} strokeWidth="5" opacity="0.18" />
        {/* swing arc */}
        <path d="M60 210 Q 150 110 280 132" {...S} strokeWidth="5" strokeDasharray="2 12" opacity="0.5" />
        <path d="M60 210 Q 150 110 280 132" {...S} strokeWidth="16" opacity="0.08" />
        {/* bat at contact */}
        <g transform="rotate(34 200 160)">
          <rect x="96" y="150" width="186" height="22" rx="11" fill={W} opacity="0.95" />
          <rect x="96" y="152" width="40" height="18" rx="9" fill={W} />
        </g>
        {/* ball compressing at contact, upper right */}
        <circle cx="296" cy="108" r="22" fill={W} />
        <path d="M278 98 q18 10 36 0" {...{ stroke: theme, fill: "none" }} strokeWidth="3" strokeDasharray="5 4" />
        <path d="M278 118 q18 -10 36 0" {...{ stroke: theme, fill: "none" }} strokeWidth="3" strokeDasharray="5 4" />
        {/* contact spark */}
        {[[268, 92], [262, 110], [274, 128], [284, 80]].map(([x, y], i) => <line key={i} x1="284" y1="108" x2={x} y2={y} {...S} strokeWidth="4" opacity="0.7" />)}
      </g>
    </Frame>
  ),

  // ── Wrestling: two locked silhouettes mid-takedown, intertwined, the mat ──
  wrestling: ({ theme }) => (
    <Frame theme={theme}>
      <g>
        <ellipse cx="200" cy="258" rx="210" ry="56" fill="#ffffff" opacity="0.1" />
        <path d="M-10 250 Q 200 222 410 252" {...S} strokeWidth="5" opacity="0.22" />
        {/* motion sweep */}
        <path d="M70 110 Q 200 70 330 130" {...S} strokeWidth="16" opacity="0.08" />
        {/* attacker, driving in low */}
        <g>
          <circle cx="150" cy="150" r="16" fill={W} />
          <path d="M158 162 Q 210 178 250 158" {...S} strokeWidth="18" />
          <line x1="166" y1="160" x2="206" y2="206" {...S} strokeWidth="12" />
          <line x1="150" y1="166" x2="138" y2="216" {...S} strokeWidth="14" />
          <line x1="138" y1="216" x2="160" y2="256" {...S} strokeWidth="13" />
          <line x1="206" y1="206" x2="206" y2="256" {...S} strokeWidth="13" />
        </g>
        {/* defender, bent over the attacker */}
        <g opacity="0.92">
          <circle cx="262" cy="120" r="15" fill={W} />
          <path d="M252 132 Q 224 162 200 168" {...S} strokeWidth="16" />
          <line x1="240" y1="146" x2="206" y2="176" {...S} strokeWidth="11" />
          <line x1="262" y1="134" x2="288" y2="178" {...S} strokeWidth="13" />
          <line x1="288" y1="178" x2="286" y2="256" {...S} strokeWidth="13" />
          <line x1="262" y1="134" x2="262" y2="200" {...S} strokeWidth="12" />
        </g>
      </g>
    </Frame>
  ),
};
