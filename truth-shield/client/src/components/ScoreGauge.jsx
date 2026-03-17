import { scorePercent, scoreZone } from '../utils/scoreHelpers';

export default function ScoreGauge({ score }) {
  const radius = 88;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const pct = scorePercent(score);
  const dashOffset = circumference - (pct / 100) * circumference;
  const zone = scoreZone(score);

  return (
    <div className="relative mx-auto h-60 w-60">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 220 220" role="img" aria-label="Authenticity gauge">
        <circle
          cx="110"
          cy="110"
          r={radius}
          stroke="rgba(128, 144, 208, 0.35)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx="110"
          cy="110"
          r={radius}
          stroke={zone.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="font-display text-5xl font-bold">{score.toFixed(1)}</p>
        <p className={`mt-1 text-sm font-semibold ${zone.color}`}>{zone.label}</p>
        <p className="text-muted mt-1 text-xs">0 = authentic, 10 = AI risk</p>
      </div>
    </div>
  );
}
