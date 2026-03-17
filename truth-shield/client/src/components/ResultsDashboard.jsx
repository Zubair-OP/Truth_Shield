import { toast } from 'react-toastify';
import CategoryBar from './CategoryBar';
import FindingCard from './FindingCard';
import ScoreGauge from './ScoreGauge';
import { scoreZone } from '../utils/scoreHelpers';

export default function ResultsDashboard({ result, onReset }) {
  const zone = scoreZone(result.score);

  const copyResult = async () => {
    const text = `Truth Shield Result\nScore: ${result.score.toFixed(1)}/10\nVerdict: ${result.verdict}\nConfidence: ${result.confidence}`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Result copied');
    } catch {
      toast.error('Copy failed. Please try again.');
    }
  };

  return (
    <section className="grid animate-riseIn grid-cols-12 gap-4">
      <div className="panel col-span-12 p-4 lg:col-span-4">
        <div className="grid h-full grid-rows-[1fr_auto]">
          <ScoreGauge score={result.score} />
          <div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${zone.bg} ${zone.color}`}>
              {zone.icon} {result.verdict}
            </span>
            <span className="rounded-full border border-[var(--line)] bg-[var(--accent-soft)] px-3 py-1 text-sm">
              Confidence: {result.confidence}
            </span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={onReset}
                className="rounded-xl border border-[var(--line)] bg-[var(--card-2)] px-4 py-2 font-semibold transition hover:brightness-105"
              >
                Analyze Another Video
              </button>
              <button
                type="button"
                onClick={copyResult}
                className="rounded-xl bg-truth-accent px-4 py-2 font-semibold text-white transition hover:brightness-110"
              >
                Copy Result
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel col-span-12 p-4 lg:col-span-8">
        <h3 className="font-display text-xl font-semibold">Category Breakdown</h3>
        <div className="mt-3 space-y-3">
            {Object.entries(result.breakdown).map(([key, value]) => (
              <CategoryBar key={key} label={key} value={Number(value)} />
            ))}
          </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="font-display text-lg font-semibold">AI Reasoning</h4>
            <div className="scrollbar-thin mt-2 max-h-44 overflow-y-auto pr-2">
              <p className="text-muted text-sm">{result.reasoning}</p>
            </div>
          </div>

          <div>
            <h4 className="font-display text-lg font-semibold">Key Findings</h4>
            <ul className="scrollbar-thin text-muted mt-2 max-h-44 list-disc space-y-1 overflow-y-auto pl-5 pr-2 text-sm">
              {(result.findings || []).map((item) => (
                <li key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="panel col-span-12 p-4 lg:col-span-6">
        <h4 className="font-display text-lg font-semibold" style={{ color: 'var(--danger)' }}>
          Red Flags
        </h4>
        <div className="scrollbar-thin mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
            {(result.red_flags || []).length ? (
              result.red_flags.map((flag) => <FindingCard key={flag} tone="danger" text={flag} />)
            ) : (
              <FindingCard tone="neutral" text="No explicit red flags detected." />
            )}
        </div>
      </div>

      <div className="panel col-span-12 p-4 lg:col-span-6">
        <h4 className="font-display text-lg font-semibold" style={{ color: 'var(--ok)' }}>
          Authentic Signals
        </h4>
        <div className="scrollbar-thin mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
            {(result.authentic_signals || []).length ? (
              result.authentic_signals
                .map((signal) => <FindingCard key={signal} tone="success" text={signal} />)
            ) : (
              <FindingCard tone="neutral" text="No strong authentic markers detected." />
            )}
        </div>
      </div>
    </section>
  );
}
