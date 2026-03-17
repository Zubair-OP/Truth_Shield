export default function FindingCard({ tone = 'neutral', text }) {
  const toneClass =
    tone === 'danger'
      ? 'border-truth-danger/50 bg-truth-danger/10 text-[var(--text)]'
      : tone === 'success'
        ? 'border-truth-authentic/50 bg-truth-authentic/10 text-[var(--text)]'
        : 'border-[var(--line)] bg-[var(--accent-soft)] text-[var(--text)]';

  return <div className={`rounded-xl border p-3 text-sm ${toneClass}`}>{text}</div>;
}
