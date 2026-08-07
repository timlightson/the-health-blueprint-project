type SleepDay = {
  day: string;
  debtHours: number;
  sleep: number;
  energy: number;
  fatigue: number;
};

function fmtHours(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function statusFor(debt: number) {
  if (debt < 0.05) return { label: "rested", accent: "#0D9488", glow: "rgba(45,212,191,.32)", sky: "#16354A" };
  if (debt < 6) return { label: "debt building", accent: "#D97706", glow: "rgba(245,158,11,.3)", sky: "#46384C" };
  return { label: "low reserve", accent: "#DC4A43", glow: "rgba(248,113,113,.32)", sky: "#492B3C" };
}

function SleepRoom({ data, index }: { data: SleepDay; index: number }) {
  const status = statusFor(data.debtHours);
  const reserve = Math.max(0.06, data.energy);
  const blanketY = 90 + data.fatigue * 7;
  const headY = 78 + data.fatigue * 4;
  const stars = [
    [28, 29], [52, 20], [76, 34], [113, 21], [139, 37], [154, 17],
  ];

  return (
    <article
      className="sleep-day-card"
      style={{ "--sleep-accent": status.accent, "--sleep-glow": status.glow } as React.CSSProperties}
    >
      <div className="sleep-day-head">
        <span>{data.day}</span>
        <span>{fmtHours(data.sleep)}h</span>
      </div>

      <div className="sleep-room-scene" style={{ background: `linear-gradient(160deg, ${status.sky}, #0A1729 78%)` }}>
        <svg viewBox="0 0 180 145" aria-hidden="true">
          <defs>
            <linearGradient id={`blanket-${index}`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor={status.accent} />
              <stop offset="1" stopColor="#16384A" />
            </linearGradient>
          </defs>

          <path d="M18 111h145" stroke="rgba(255,255,255,.12)" />
          <path d="M22 111v19M158 111v19" stroke="rgba(255,255,255,.3)" strokeWidth="3" strokeLinecap="round" />

          {stars.slice(0, Math.max(2, 6 - Math.floor(data.fatigue * 4))).map(([x, y], i) => (
            <circle key={i} className="sleep-star" cx={x} cy={y} r={i % 2 ? 1.3 : 1.8} fill="#F7E8A6" style={{ animationDelay: `${i * 320 + index * 120}ms` }} />
          ))}
          <path d="M137 25a14 14 0 1 1-13-18 11 11 0 0 0 13 18Z" fill="#F7E8A6" opacity=".9" />
          <circle cx="137" cy="24" r="25" fill={status.glow} opacity=".55" />

          <rect x="25" y="80" width="136" height="34" rx="9" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.22)" />
          <rect x="30" y="82" width="38" height="18" rx="9" fill="#F7F1E8" />
          <circle cx="61" cy={headY} r="13" fill="#D99A78" />
          <path d={`M48 ${headY - 1}c2-15 25-15 27 0-8-5-19-6-27 0Z`} fill="#162238" />
          <path d={`M68 ${blanketY}C91 ${blanketY - 10} 124 ${blanketY - 5} 159 ${blanketY + 2}v23H68Z`} fill={`url(#blanket-${index})`} />
          <path d={`M74 ${blanketY + 4}c23-7 52-4 77 4`} stroke="rgba(255,255,255,.25)" strokeWidth="2" strokeLinecap="round" />

          {[0, 1, 2].slice(0, data.fatigue > 0.75 ? 1 : data.fatigue > 0.35 ? 2 : 3).map((n) => (
            <text key={n} className="sleep-z" x={84 + n * 13} y={68 - n * 12} fill="#D9F4EF" fontSize={10 + n * 2} fontWeight="700" style={{ animationDelay: `${n * 450 + index * 180}ms` }}>z</text>
          ))}
        </svg>

        <div className="sleep-reserve" aria-label={`${Math.round(reserve * 100)} percent rest reserve`}>
          <span>rest reserve</span>
          <div><i style={{ width: `${reserve * 100}%`, background: status.accent }} /></div>
        </div>
      </div>

      <div className="sleep-day-foot">
        <strong style={{ color: status.accent }}>
          {data.debtHours < 0.05 ? "Full reserve" : `−${fmtHours(data.debtHours)}h`}
        </strong>
        <span>{status.label}</span>
      </div>
    </article>
  );
}

export default function WeekdaySleepStatus({ days }: { days: SleepDay[] }) {
  return (
    <div className="sleep-week-feature">
      <div className="sleep-week-title">
        <div>
          <p>Your week at a glance</p>
          <span>Each room shows that night&apos;s sleep and the reserve carried into the next day.</span>
        </div>
        <div className="sleep-week-direction" aria-hidden="true"><span>MON</span><i /><span>FRI</span></div>
      </div>
      <div className="sleep-week-scroll">
        <div className="sleep-week-grid">
          {days.map((data, index) => <SleepRoom key={data.day} data={data} index={index} />)}
        </div>
      </div>
    </div>
  );
}
