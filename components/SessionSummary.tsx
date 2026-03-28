"use client";

type Props = {
  total: number;
  correct: number;
  bySense: Record<string, boolean>;
  senseLabels: Record<string, string>;
  runScore?: number;
  runLabel?: string;
  /** Inside SummaryFold: no outer card / main heading */
  embedded?: boolean;
};

export function SessionSummary({
  total,
  correct,
  bySense,
  senseLabels,
  runScore,
  runLabel,
  embedded,
}: Props) {
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const shell = embedded
    ? "pt-1"
    : "rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_75%,transparent)] p-5";
  return (
    <div className={shell}>
      {embedded ? (
        runLabel ? (
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            {runLabel} run
          </p>
        ) : null
      ) : (
        <h3 className="font-display text-display-tight font-semibold text-[var(--text)]">
          Session summary{runLabel ? ` · ${runLabel}` : ""}
        </h3>
      )}
      {runScore != null && runScore > 0 && (
        <p className={`text-ui font-medium text-[var(--accent)] ${embedded ? "mt-1" : "mt-2"}`}>
          Run score: {runScore}
        </p>
      )}
      <p className="mt-2 font-display text-2xl font-bold text-[var(--accent)]">
        {correct} / {total}{" "}
        <span className="text-base font-normal text-[var(--muted)]">({pct}%)</span>
      </p>
      <ul className="mt-4 space-y-2 text-ui">
        {Object.entries(bySense).map(([id, ok]) => (
          <li key={id} className="flex justify-between gap-2">
            <span className="text-[var(--muted)]">{senseLabels[id] || id}</span>
            <span className={ok ? "text-[var(--success)]" : "text-[var(--warning)]"}>
              {ok ? "Correct" : "Review"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-ui-sm leading-relaxed text-[var(--muted-2)]">
        Tip: revisit senses marked “Review” — polysemy errors cluster around similar-looking
        fragments.
      </p>
    </div>
  );
}
