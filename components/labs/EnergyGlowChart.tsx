"use client";
import { useEffect, useId, useRef, useState } from "react";

/** Responsive plot: labels keep their size as the drawing changes width. */
export default function EnergyGlowChart({
  curve,
  peakT,
  minT,
  startH,
  endH,
  step,
  eMax,
}: {
  curve: number[];
  peakT: number;
  minT: number;
  startH: number;
  endH: number;
  step: number;
  eMax: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const uid = useId();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) =>
      setWidth(Math.max(240, entry.contentRect.width)),
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const height = 260,
    left = 22,
    right = 22,
    top = 38,
    bottom = 40;
  const plotW = width - left - right,
    plotH = height - top - bottom;
  const x = (t: number) => left + ((t - startH) / (endH - startH)) * plotW;
  const y = (v: number) =>
    top + (1 - Math.max(0, Math.min(eMax, v)) / eMax) * plotH;
  const path = curve
    .map(
      (v, i) =>
        `${i ? "L" : "M"}${x(startH + i * step).toFixed(2)},${y(v).toFixed(2)}`,
    )
    .join(" ");
  const index = (t: number) =>
    Math.max(0, Math.min(curve.length - 1, Math.round((t - startH) / step)));
  const time = (t: number) =>
    `${t === 24 ? 12 : t > 12 ? t - 12 : t}${t >= 12 && t < 24 ? "p" : "a"}`;
  const ticks = width < 450 ? [6, 12, 18, 24] : [6, 9, 12, 15, 18, 21, 24];
  return (
    <div ref={ref} className="energy-chart">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${uid}-title ${uid}-desc`}
      >
        <title id={`${uid}-title`}>Your modeled energy across the day</title>
        <desc id={`${uid}-desc`}>
          Relative energy from 6 AM to midnight. Peak near {time(peakT)}, lowest
          near {time(minT)}. Change activities below to update the curve.
        </desc>
        <defs><linearGradient id={`${uid}-fill`} x2="0" y2="1"><stop stopColor="#7ba99b" stopOpacity=".35"/><stop offset="1" stopColor="#7ba99b" stopOpacity=".025"/></linearGradient></defs>
        {[.25,.5,.75].map(v=><line key={v} x1={left} x2={width-right} y1={top+plotH*v} y2={top+plotH*v} stroke="#cbd9d2" strokeDasharray="3 5"/>)}
        {ticks.map(t=><line key={t} x1={x(t)} x2={x(t)} y1={top} y2={height-bottom} stroke="#dce6df"/>)}
        <text x={left} y={20} fill="#526c72" fontSize="13">
          Relative energy
        </text>
        <path
          d={`${path} L${x(endH)},${height - bottom} L${left},${height - bottom} Z`}
          fill={`url(#${uid}-fill)`}
        />
        <path
          d={path}
          fill="none"
          stroke="#137264"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {[
          [peakT, "Peak"],
          [minT, "Low"],
        ].map(([t, label]) => {
          const tt = Number(t);
          return (
            <g key={label}>
              <line x1={x(tt)} x2={x(tt)} y1={y(curve[index(tt)])+8} y2={height-bottom} stroke="#55877a" strokeDasharray="3 4" opacity=".55"/>
              <circle
                cx={x(tt)}
                cy={y(curve[index(tt)])}
                r="5"
                fill="#137264"
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={Math.max(30, Math.min(width - 30, x(tt)))}
                y={Math.max(36, y(curve[index(tt)]) - 14)}
                textAnchor="middle"
                fontSize="13"
                fontWeight="600"
                fill="#164f46"
              >
                {label}
              </text>
            </g>
          );
        })}
        {ticks.map((t) => (
          <text
            key={t}
            x={x(t)}
            y={height - 12}
            textAnchor="middle"
            fontSize="13"
            fill="#526c72"
          >
            {time(t)}
          </text>
        ))}
      </svg>
    </div>
  );
}
