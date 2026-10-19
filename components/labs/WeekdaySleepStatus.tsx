type SleepDay = {
  day: string;
  debtHours: number;
  sleep: number;
  energy: number;
  fatigue: number;
};
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
export default function WeekdaySleepStatus({ days }: { days: SleepDay[] }) {
  const maximum = Math.max(9, ...days.map((d) => d.debtHours));
  return (
    <div className="sleep-week">
      <div className="sleep-week-heading">
        <h2>Watch the week add up.</h2>
        <p>Accumulated sleep debt in this model</p>
      </div>
      <div className="sleep-week-bars">
        {days.map((day) => (
          <div key={day.day} className="sleep-week-day">
            <strong>
              {fmt(day.debtHours)}
              <span> h</span>
            </strong>
            <div className="sleep-week-track" aria-hidden="true">
              <div
                style={{
                  transform: `scaleY(${Math.max(0.025, day.debtHours / maximum)})`,
                  background:
                    day.debtHours < 0.05
                      ? "#0b766b"
                      : day.debtHours < 6
                        ? "#b17128"
                        : "#be4b43",
                }}
              />
            </div>
            <span>{day.day}</span>
            <small>{fmt(day.sleep)} h sleep</small>
          </div>
        ))}
      </div>
    </div>
  );
}
