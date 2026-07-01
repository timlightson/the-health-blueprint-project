// Illustrated cover art for each game tile. Each fills its tile like a poster.

const svgProps = {
  viewBox: "0 0 400 300",
  preserveAspectRatio: "xMidYMid slice" as const,
  style: { width: "100%", height: "100%", display: "block" as const },
};

function ReactionCover() {
  return (
    <svg {...svgProps} aria-hidden="true">
      <rect width="400" height="300" fill="#0B1B2E" />
      <g>
        <rect x="18" y="116" width="130" height="7" rx="3.5" fill="#0D9488" opacity="0.22" />
        <rect x="40" y="146" width="100" height="7" rx="3.5" fill="#5EEAD4" opacity="0.4" />
        <rect x="26" y="176" width="120" height="7" rx="3.5" fill="#0D9488" opacity="0.18" />
      </g>
      <circle cx="176" cy="150" r="46" fill="#0D9488" opacity="0.12" />
      <circle cx="208" cy="150" r="55" fill="#0D9488" opacity="0.26" />
      <circle cx="252" cy="150" r="66" fill="#0D9488" />
      <circle cx="252" cy="150" r="66" fill="none" stroke="#5EEAD4" strokeWidth="3" opacity="0.75" />
      <circle cx="232" cy="130" r="20" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
}

function MemoryCover() {
  const cells = [
    { c: "#0D9488", lit: true },
    { c: "#D97706", lit: false },
    { c: "#2DD4BF", lit: true },
    { c: "#C2410C", lit: false },
    { c: "#14B8A6", lit: false },
    { c: "#F59E0B", lit: true },
  ];
  return (
    <svg {...svgProps} aria-hidden="true">
      <rect width="400" height="300" fill="#14202E" />
      {cells.map((cell, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 58 + col * 100;
        const y = 56 + row * 102;
        return (
          <g key={i}>
            {cell.lit && (
              <rect x={x - 6} y={y - 6} width="90" height="90" rx="14" fill={cell.c} opacity="0.3" />
            )}
            <rect
              x={x}
              y={y}
              width="78"
              height="78"
              rx="11"
              fill={cell.c}
              opacity={cell.lit ? 1 : 0.32}
            />
          </g>
        );
      })}
    </svg>
  );
}

function FocusCover() {
  const cols = 5;
  const rows = 4;
  const oddIndex = 12;
  return (
    <svg {...svgProps} aria-hidden="true">
      <rect width="400" height="300" fill="#0D9488" />
      {Array.from({ length: cols * rows }, (_, i) => {
        const x = 56 + (i % cols) * 73;
        const y = 76 + Math.floor(i / cols) * 62;
        const odd = i === oddIndex;
        return (
          <g key={i}>
            {odd && <rect x={x - 22} y={y - 30} width="44" height="44" rx="8" fill="#F9F7F2" />}
            <text
              x={x}
              y={y}
              textAnchor="middle"
              fontSize="34"
              fontWeight="700"
              fill={odd ? "#001A33" : "#FFFFFF"}
              opacity={odd ? 1 : 0.5}
            >
              {odd ? "Q" : "O"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PatternCover() {
  const dots = Array.from({ length: 9 }, (_, i) => ({
    x: 120 + (i % 3) * 80,
    y: 70 + Math.floor(i / 3) * 80,
  }));
  const path = [0, 1, 5, 4, 6, 7];
  const pts = path.map((i) => `${dots[i].x},${dots[i].y}`).join(" ");
  return (
    <svg {...svgProps} aria-hidden="true">
      <defs>
        <linearGradient id="patternCover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F0915A" />
          <stop offset="1" stopColor="#D9610E" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#patternCover)" />
      <polyline points={pts} fill="none" stroke="#FFFFFF" strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" opacity="0.3" />
      <polyline points={pts} fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" opacity="0.95" />
      {dots.map((d, i) => {
        const on = path.includes(i);
        return (
          <circle key={i} cx={d.x} cy={d.y} r={on ? 12 : 9} fill="#FFFFFF" opacity={on ? 1 : 0.4} />
        );
      })}
    </svg>
  );
}

function WordCover() {
  const noise = "QXZJWKVBFPGHMTLYCD".split("");
  const word = "DREAM".split("");
  return (
    <svg {...svgProps} aria-hidden="true">
      <rect width="400" height="300" fill="#3A2F6E" />
      {noise.map((ch, i) => (
        <text
          key={i}
          x={30 + ((i * 53) % 350)}
          y={48 + ((i * 71) % 230)}
          fontSize="26"
          fontWeight="700"
          fill="#FFFFFF"
          opacity="0.16"
        >
          {ch}
        </text>
      ))}
      <rect x="48" y="128" width="304" height="52" rx="8" fill="#FFFFFF" opacity="0.1" />
      {word.map((ch, i) => (
        <text
          key={i}
          x={78 + i * 62}
          y={168}
          textAnchor="middle"
          fontSize="42"
          fontWeight="800"
          fill="#FFFFFF"
        >
          {ch}
        </text>
      ))}
    </svg>
  );
}

function MathCover() {
  return (
    <svg {...svgProps} aria-hidden="true">
      <rect width="400" height="300" fill="#F2C12E" />
      <text x="200" y="118" textAnchor="middle" fontSize="62" fontWeight="800" fill="#001A33">
        8 × 7
      </text>
      <text x="200" y="160" textAnchor="middle" fontSize="30" fontWeight="700" fill="#001A33" opacity="0.7">
        = ?
      </text>
      {[
        { x: 110, n: "54" },
        { x: 200, n: "56" },
        { x: 290, n: "63" },
      ].map((b) => (
        <g key={b.n}>
          <rect x={b.x - 42} y="196" width="84" height="56" rx="12" fill="#001A33" opacity="0.12" />
          <rect x={b.x - 42} y="196" width="84" height="56" rx="12" fill="none" stroke="#001A33" strokeWidth="2.5" />
          <text x={b.x} y="232" textAnchor="middle" fontSize="28" fontWeight="800" fill="#001A33">
            {b.n}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StroopCover() {
  const swatches = [
    { x: 44, y: 50, c: "#DC2626" },
    { x: 320, y: 44, c: "#0D9488" },
    { x: 36, y: 210, c: "#CA8A04" },
    { x: 332, y: 214, c: "#7C3AED" },
    { x: 60, y: 132, c: "#EA7317" },
    { x: 312, y: 134, c: "#2563EB" },
  ];
  return (
    <svg {...svgProps} aria-hidden="true">
      <rect width="400" height="300" fill="#1A1530" />
      {swatches.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width="44" height="44" rx="9" fill={s.c} opacity="0.85" />
      ))}
      <text x="200" y="172" textAnchor="middle" fontSize="74" fontWeight="800" fill="#2563EB">
        RED
      </text>
    </svg>
  );
}

function SpotCover() {
  const panel = (ox: number, sun: boolean) => (
    <g>
      <rect x={ox} y="78" width="150" height="144" rx="12" fill="#2C4A6E" />
      {sun && <circle cx={ox + 38} cy="116" r="20" fill="#F2C12E" />}
      <polygon
        points={`${ox + 100},108 ${ox + 78},162 ${ox + 122},162`}
        fill="#0D9488"
      />
      <rect x={ox + 44} y="168" width="62" height="38" rx="5" fill="#D97706" />
    </g>
  );
  return (
    <svg {...svgProps} aria-hidden="true">
      <rect width="400" height="300" fill="#1E3A5F" />
      {panel(28, true)}
      {panel(222, false)}
      <circle cx={260} cy="116" r="30" fill="none" stroke="#F0915A" strokeWidth="4" strokeDasharray="6 5" />
    </svg>
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
