const steps = ['Uploading...', 'Extracting Frames...', 'Analyzing with AI...', 'Calculating Score...'];

export default function AnalyzingScreen({ progress, step }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
      <div className="panel w-[92%] max-w-xl p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border-2 border-truth-accent text-5xl animate-spinSlow">
          🛡️
        </div>
        <h3 className="font-display text-3xl font-semibold">Truth Shield Analysis Running</h3>
        <p className="text-muted mt-2">This can take up to 2 minutes for larger files.</p>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-[var(--accent-soft)]">
          <div
            className="h-full rounded-full bg-truth-accent transition-all duration-500"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>

        <p className="mt-3 text-sm">{Math.round(progress)}% complete</p>

        <div className="mt-6 space-y-2 text-left">
          {steps.map((item) => {
            const done = steps.indexOf(item) < steps.indexOf(step);
            const active = item === step;

            return (
              <div
                key={item}
                className={`rounded-lg px-3 py-2 text-sm ${
                  active
                    ? 'bg-truth-accent/20 text-theme'
                    : done
                      ? 'bg-truth-authentic/20 text-truth-authentic'
                      : 'bg-[var(--accent-soft)] text-[var(--muted)]'
                }`}
              >
                {done ? '✓ ' : active ? '● ' : '○ '}
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
