"use client";

import type { CSSProperties } from "react";
import { useMotionPresence } from "@/hooks/use-motion-presence";

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
  if (debt < 0.05) return { label: "rested", accent: "#0D9488", glow: "rgba(45,212,191,.28)" };
  if (debt < 6) return { label: "debt building", accent: "#D97706", glow: "rgba(245,158,11,.27)" };
  return { label: "low reserve", accent: "#DC4A43", glow: "rgba(248,113,113,.3)" };
}

function StudentDay({ data, index }: { data: SleepDay; index: number }) {
  const status = statusFor(data.debtHours);
  const fatigue = Math.max(0, Math.min(1, data.fatigue));
  const reserve = Math.max(0.06, data.energy);
  const sceneStyle = {
    "--fatigue": fatigue,
    "--energy": reserve,
    "--day-accent": status.accent,
    "--day-glow": status.glow,
    "--day-delay": `${index * 90}ms`,
    "--story-sky-a": fatigue * .42,
    "--story-sky-b": fatigue * .35,
    "--story-sun-y": `${fatigue * 20}px`,
    "--story-sun-opacity": 1 - fatigue * .34,
    "--story-lamp-angle": `${-7 - fatigue * 10}deg`,
    "--story-lamp-opacity": 1 - fatigue * .35,
    "--story-cup-opacity": .2 + fatigue * .8,
    "--story-shadow-scale": 1 + fatigue * .18,
    "--story-student-y": `${fatigue * 5}px`,
    "--story-student-angle": `${fatigue * 8}deg`,
    "--story-idle-duration": `${3.2 + fatigue * 3.8}s`,
    "--story-idle-rise": `${-3 + fatigue * 2}px`,
    "--story-head-angle": `${fatigue * 10}deg`,
    "--story-head-y": `${fatigue * 3}px`,
    "--story-eye-scale": 1 - fatigue * .72,
    "--story-arm-back": `${-10 + fatigue * 18}deg`,
    "--story-arm-front": `${9 + fatigue * 22}deg`,
    "--story-leg-back": `${2 + fatigue * 8}deg`,
    "--story-leg-front": `${-2 + fatigue * 6}deg`,
    "--story-pack-x": `${fatigue * -5}px`,
    "--story-pack-scale": .9 + fatigue * .18,
    "--story-fatigue-opacity": fatigue * .85,
    "--story-weight-y": `${fatigue * 10}px`,
    "--story-drift-opacity": fatigue * .8,
  } as CSSProperties;

  return (
    <article className="sleep-story-day" style={sceneStyle}>
      <div className="sleep-story-head">
        <span>{data.day}</span>
        <span>{fmtHours(data.sleep)}h</span>
      </div>

      <div className="sleep-story-scene" aria-hidden="true">
        <div className="sleep-story-sky" />
        <div className="sleep-story-window">
          <i className="sleep-story-sun" />
          <span className="sleep-story-cloud cloud-one" />
          <span className="sleep-story-cloud cloud-two" />
        </div>
        <div className="sleep-story-desk">
          <i className="sleep-story-lamp"><b /></i>
          <span className="sleep-story-books"><i /><i /><i /></span>
          <span className="sleep-story-cup" />
        </div>
        <div className="sleep-story-shadow" />
        <div className="sleep-story-student">
          <span className="sleep-story-backpack" />
          <span className="sleep-story-leg leg-back" />
          <span className="sleep-story-leg leg-front" />
          <span className="sleep-story-shoe shoe-back" />
          <span className="sleep-story-shoe shoe-front" />
          <span className="sleep-story-body" />
          <span className="sleep-story-arm arm-back" />
          <span className="sleep-story-arm arm-front" />
          <span className="sleep-story-neck" />
          <span className="sleep-story-head-shape">
            <i className="sleep-story-hair" />
            <b className="sleep-story-eye eye-left" />
            <b className="sleep-story-eye eye-right" />
            <em className="sleep-story-mouth" />
          </span>
        </div>
        <div className="sleep-story-drift drift-one">z</div>
        <div className="sleep-story-drift drift-two">z</div>
        <div className="sleep-story-weight"><i /><i /><i /></div>
        <div className="sleep-story-floor" />
      </div>

      <div className="sleep-story-reserve">
        <div className="sleep-story-reserve-copy">
          <span>rest reserve</span>
          <strong style={{ color: status.accent }}>{Math.round(reserve * 100)}%</strong>
        </div>
        <div className="sleep-story-track"><i style={{ width: `${reserve * 100}%`, background: status.accent }} /></div>
      </div>

      <div className="sleep-story-foot">
        <strong style={{ color: status.accent }}>
          {data.debtHours < 0.05 ? "Full reserve" : `−${fmtHours(data.debtHours)}h`}
        </strong>
        <span>{status.label}</span>
      </div>
    </article>
  );
}

export default function WeekdaySleepStatus({ days }: { days: SleepDay[] }) {
  const { ref, motionActive } = useMotionPresence<HTMLDivElement>();

  return (
    <div ref={ref} className={`sleep-week-feature sleep-story ${motionActive ? "is-motion-active" : ""}`}>
      <div className="sleep-week-title">
        <div>
          <p>Watch the same student reach Friday</p>
          <span>Posture, pace, and morning light change with the reserve carried into each day.</span>
        </div>
        <div className="sleep-week-direction" aria-hidden="true"><span>MON</span><i /><span>FRI</span></div>
      </div>
      <div className="sleep-week-scroll">
        <div className="sleep-week-grid">
          {days.map((data, index) => <StudentDay key={data.day} data={data} index={index} />)}
        </div>
      </div>
    </div>
  );
}
