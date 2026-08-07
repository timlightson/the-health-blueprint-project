import type { ReactNode } from "react";

const svgProps = {
  viewBox: "0 0 400 300",
  preserveAspectRatio: "xMidYMid slice" as const,
  style: { width: "100%", height: "100%", display: "block" as const },
};

function Stage({ id, from, to, children }: { id: string; from: string; to: string; children: ReactNode }) {
  return (
    <svg {...svgProps} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor={from} /><stop offset="1" stopColor={to} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="45%" r="55%">
          <stop stopColor="#FFFFFF" stopOpacity=".28" /><stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${id}-grid`} width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="#fff" strokeOpacity=".055" />
          <circle cx="1" cy="1" r="1" fill="#fff" fillOpacity=".1" />
        </pattern>
        <filter id={`${id}-shadow`} x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#020817" floodOpacity=".38" />
        </filter>
        <filter id={`${id}-soft`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}-bg)`} />
      <rect width="400" height="300" fill={`url(#${id}-grid)`} />
      <circle cx="332" cy="28" r="132" fill={`url(#${id}-glow)`} />
      <path d="M-28 270C88 201 278 226 432 121" fill="none" stroke="#fff" strokeOpacity=".07" strokeWidth="42" />
      {children}
      <path d="M0 0H400V62C290 24 151 57 0 29Z" fill="#fff" fillOpacity=".055" />
    </svg>
  );
}

function ReactionCover() {
  return (
    <Stage id="reaction" from="#092640" to="#061321">
      <g className="game-cover-drift" filter="url(#reaction-shadow)">
        <circle cx="238" cy="132" r="82" fill="#0D9488" fillOpacity=".2" stroke="#63E6D5" strokeOpacity=".35" />
        <circle className="game-cover-ring" cx="238" cy="132" r="61" fill="#0E8A7D" stroke="#A7F3D0" strokeWidth="3" />
        <circle cx="216" cy="108" r="18" fill="#fff" fillOpacity=".28" />
        <path d="M238 86v46l31 19" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="238" cy="132" r="8" fill="#fff" />
      </g>
      <g className="game-cover-speed-lines">
        <path d="M34 95h103M19 132h126M49 169h88" stroke="#5EEAD4" strokeLinecap="round" strokeWidth="7" opacity=".28" />
        <path d="M78 76h73M65 188h86" stroke="#fff" strokeLinecap="round" strokeWidth="3" opacity=".17" />
      </g>
      <path className="game-cover-tap" d="M306 184l-17-39 37 17-13 7 9 17-9 5-9-17Z" fill="#F8FAFC" stroke="#092640" strokeWidth="3" />
      <text x="31" y="43" fill="#99F6E4" fontSize="11" fontWeight="700" letterSpacing="2">READY / SET / TAP</text>
    </Stage>
  );
}

function MemoryCover() {
  const tiles = [
    [82, 74, "#2DD4BF", 0], [174, 62, "#F59E0B", 1], [266, 75, "#60A5FA", 2],
    [92, 161, "#8B5CF6", 3], [184, 151, "#14B8A6", 4], [276, 163, "#F97316", 5],
  ] as const;
  return (
    <Stage id="memory" from="#172E43" to="#0A1625">
      <path className="game-cover-draw" d="M121 113C148 92 167 92 195 101s47 22 92 8" fill="none" stroke="#fff" strokeOpacity=".58" strokeWidth="3" strokeDasharray="7 7" />
      {tiles.map(([x, y, color, i]) => (
        <g key={i} className={i === 0 || i === 4 || i === 5 ? "game-cover-memory-lit" : "game-cover-float"} style={{ animationDelay: `${i * 120}ms` }} filter="url(#memory-shadow)">
          <rect x={x - 4} y={y + 8} width="68" height="68" rx="15" fill="#020817" opacity=".32" />
          <rect x={x} y={y} width="68" height="68" rx="15" fill={color} opacity={i === 0 || i === 4 || i === 5 ? 1 : .42} stroke="#fff" strokeOpacity=".28" />
          <rect x={x + 8} y={y + 7} width="43" height="16" rx="8" fill="#fff" opacity=".16" />
          <text x={x + 34} y={y + 43} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">{i + 1}</text>
        </g>
      ))}
      <text x="30" y="40" fill="#CCFBF1" fontSize="11" fontWeight="700" letterSpacing="2">REMEMBER THE ORDER</text>
    </Stage>
  );
}

function FocusCover() {
  const letters = Array.from({ length: 20 }, (_, i) => ({ x: 72 + (i % 5) * 61, y: 72 + Math.floor(i / 5) * 50, odd: i === 13 }));
  return (
    <Stage id="focus" from="#148F83" to="#075C5D">
      <path d="M274 20 185 261h170Z" fill="#FFF7D6" opacity=".12" />
      <circle cx="255" cy="179" r="47" fill="#F8FAFC" opacity=".13" filter="url(#focus-soft)" />
      {letters.map((p, i) => (
        <g key={i} className={p.odd ? "game-cover-focus-target" : ""}>
          {p.odd && <rect x={p.x - 22} y={p.y - 31} width="44" height="44" rx="12" fill="#F8FAFC" filter="url(#focus-shadow)" />}
          <text x={p.x} y={p.y} textAnchor="middle" fill={p.odd ? "#073B45" : "#fff"} opacity={p.odd ? 1 : .48} fontSize="27" fontWeight="800">{p.odd ? "Q" : "O"}</text>
        </g>
      ))}
      <circle className="game-cover-orbit" cx="255" cy="179" r="36" fill="none" stroke="#FDE68A" strokeWidth="2" strokeDasharray="5 7" />
      <text x="29" y="41" fill="#CCFBF1" fontSize="11" fontWeight="700" letterSpacing="2">FIND THE OUTLIER</text>
    </Stage>
  );
}

function PatternCover() {
  const dots = Array.from({ length: 9 }, (_, i) => ({ x: 126 + (i % 3) * 72, y: 75 + Math.floor(i / 3) * 65 }));
  const path = [0, 1, 5, 4, 6, 7];
  const pts = path.map((i) => `${dots[i].x},${dots[i].y}`).join(" ");
  return (
    <Stage id="pattern" from="#F08A4B" to="#B94622">
      <g transform="rotate(-4 200 150)" filter="url(#pattern-shadow)">
        <rect x="78" y="37" width="244" height="226" rx="34" fill="#111B2E" stroke="#fff" strokeOpacity=".28" strokeWidth="2" />
        <rect x="91" y="50" width="218" height="199" rx="24" fill="#182641" />
        <polyline className="game-cover-draw" points={pts} fill="none" stroke="#FB923C" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" opacity=".23" />
        <polyline className="game-cover-draw" points={pts} fill="none" stroke="#FFF7ED" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={path.includes(i) ? 10 : 7} fill={path.includes(i) ? "#FFF7ED" : "#64748B"} stroke="#FB923C" strokeWidth={path.includes(i) ? 3 : 1} />)}
      </g>
      <text x="28" y="38" fill="#FFF7ED" fontSize="11" fontWeight="700" letterSpacing="2">TRACE / RECALL</text>
    </Stage>
  );
}

function WordCover() {
  const noise = ["Q","X","J","W","K","V","B","F","P","G","H","M"];
  return (
    <Stage id="word" from="#504087" to="#251E50">
      {noise.map((ch, i) => (
        <g key={i} className="game-cover-letter" style={{ animationDelay: `${i * 110}ms` }}>
          <circle cx={34 + ((i * 71) % 342)} cy={56 + ((i * 53) % 178)} r="17" fill="#fff" opacity=".08" />
          <text x={34 + ((i * 71) % 342)} y={62 + ((i * 53) % 178)} textAnchor="middle" fill="#fff" opacity=".27" fontSize="16" fontWeight="700">{ch}</text>
        </g>
      ))}
      <g filter="url(#word-shadow)">
        <rect x="54" y="104" width="292" height="84" rx="25" fill="#17142F" stroke="#C4B5FD" strokeOpacity=".45" />
        <rect x="67" y="117" width="266" height="58" rx="17" fill="#fff" opacity=".08" />
        {"DREAM".split("").map((ch, i) => (
          <g key={ch} className="game-cover-word-tile" style={{ animationDelay: `${i * 100}ms` }}>
            <rect x={77 + i * 51} y="124" width="42" height="42" rx="10" fill={i === 4 ? "#F59E0B" : "#7C3AED"} />
            <text x={98 + i * 51} y="154" textAnchor="middle" fill="#fff" fontSize="23" fontWeight="800">{ch}</text>
          </g>
        ))}
      </g>
      <path className="game-cover-orbit" d="M86 226c69 28 159 22 226-13" fill="none" stroke="#DDD6FE" strokeOpacity=".45" strokeDasharray="5 8" />
      <text x="29" y="41" fill="#EDE9FE" fontSize="11" fontWeight="700" letterSpacing="2">FIND THE CONNECTION</text>
    </Stage>
  );
}

function MathCover() {
  return (
    <Stage id="math" from="#F7CF54" to="#E8A925">
      <circle cx="319" cy="76" r="43" fill="#0B1A2B" opacity=".13" />
      <circle className="game-cover-countdown" cx="319" cy="76" r="31" fill="none" stroke="#0B1A2B" strokeWidth="5" strokeDasharray="145 50" strokeLinecap="round" />
      <text x="319" y="84" textAnchor="middle" fontSize="21" fontWeight="800" fill="#0B1A2B">08</text>
      <g filter="url(#math-shadow)">
        <rect x="47" y="72" width="248" height="108" rx="27" fill="#FFF8DE" />
        <text x="171" y="139" textAnchor="middle" fontSize="52" fontWeight="850" fill="#0B1A2B">8 × 7</text>
        <rect x="231" y="98" width="44" height="44" rx="13" fill="#0B1A2B" />
        <text x="253" y="129" textAnchor="middle" fontSize="24" fontWeight="800" fill="#F7CF54">?</text>
      </g>
      {["54", "56", "63"].map((n, i) => (
        <g key={n} className={i === 1 ? "game-cover-answer" : ""}>
          <rect x={67 + i * 94} y="205" width="76" height="48" rx="15" fill={i === 1 ? "#0B1A2B" : "#fff"} fillOpacity={i === 1 ? 1 : .5} stroke="#0B1A2B" strokeOpacity=".35" />
          <text x={105 + i * 94} y="236" textAnchor="middle" fontSize="21" fontWeight="800" fill={i === 1 ? "#fff" : "#0B1A2B"}>{n}</text>
        </g>
      ))}
      <text x="29" y="40" fill="#0B1A2B" fontSize="11" fontWeight="750" letterSpacing="2">BEAT THE CLOCK</text>
    </Stage>
  );
}

function StroopCover() {
  return (
    <Stage id="stroop" from="#21183D" to="#0E1026">
      <g className="game-cover-color-orbs">
        {[[61,64,"#F43F5E"],[337,68,"#14B8A6"],[56,224,"#F59E0B"],[338,222,"#8B5CF6"]].map(([x,y,c],i) => <circle key={i} cx={x} cy={y} r="31" fill={c as string} opacity=".72" />)}
      </g>
      <g filter="url(#stroop-shadow)">
        <rect x="67" y="91" width="266" height="119" rx="28" fill="#15152E" stroke="#fff" strokeOpacity=".14" />
        <text x="200" y="167" textAnchor="middle" fontSize="67" fontWeight="900" fill="#3B82F6">RED</text>
        <path d="M102 183h196" stroke="#F43F5E" strokeWidth="7" strokeLinecap="round" />
      </g>
      <g className="game-cover-choice-row">
        {["#F43F5E","#3B82F6","#F59E0B","#14B8A6"].map((c,i) => <rect key={c} x={119+i*43} y="229" width="31" height="18" rx="9" fill={c} opacity={i===1?1:.5} />)}
      </g>
      <text x="28" y="41" fill="#EDE9FE" fontSize="11" fontWeight="700" letterSpacing="2">NAME THE INK</text>
    </Stage>
  );
}

function SpotCover() {
  const room = (ox: number, changed: boolean) => (
    <g>
      <rect x={ox} y="63" width="143" height="166" rx="19" fill="#DDECF4" opacity=".95" />
      <rect x={ox + 12} y="77" width="119" height="138" rx="13" fill="#294B6A" />
      <circle cx={ox + 33} cy="105" r={changed ? 13 : 19} fill="#F7CC58" />
      <path d={`M${ox+18} 183 58 132 91 169 118 126 132 183Z`} fill="#0E8A7D" />
      <rect x={ox + 38} y="171" width="64" height="30" rx="6" fill={changed ? "#F97316" : "#D97706"} />
      <path d={`M${ox+48} 171v-17h44v17`} stroke="#FFF7ED" strokeWidth="4" />
      <circle cx={ox + 114} cy="96" r="5" fill={changed ? "#F43F5E" : "#60A5FA"} />
    </g>
  );
  return (
    <Stage id="spot" from="#31597E" to="#172E4A">
      <g filter="url(#spot-shadow)">{room(35,false)}{room(222,true)}</g>
      <g className="game-cover-magnify">
        <circle cx="309" cy="101" r="31" fill="#fff" fillOpacity=".08" stroke="#FDBA74" strokeWidth="5" />
        <path d="m331 124 24 24" stroke="#FDBA74" strokeWidth="8" strokeLinecap="round" />
      </g>
      <path d="M195 70v151" stroke="#fff" strokeOpacity=".19" strokeDasharray="3 6" />
      <text x="28" y="40" fill="#E0F2FE" fontSize="11" fontWeight="700" letterSpacing="2">SCAN EVERY DETAIL</text>
    </Stage>
  );
}

export const COVERS: Record<string, () => React.ReactElement> = {
  reaction: ReactionCover,
  memory: MemoryCover,
  focus: FocusCover,
  pattern: PatternCover,
  word: WordCover,
  math: MathCover,
  stroop: StroopCover,
  spot: SpotCover,
};
