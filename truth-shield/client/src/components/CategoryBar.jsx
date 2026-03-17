export default function CategoryBar({ label, value }) {
  const normalized = Math.max(0, Math.min(10, value));
  const pct = (normalized / 10) * 100;

  let barColor = 'bg-truth-warning';
  if (normalized <= 3) barColor = 'bg-truth-authentic';
  if (normalized >= 7) barColor = 'bg-truth-danger';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted capitalize">{label.replace('_', ' ')}</span>
        <span className="font-semibold">{normalized.toFixed(1)}/10</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[var(--accent-soft)]">
        <div className={`h-full ${barColor} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
