"use client";

type Props = {
  words: string[];
  /** Optional coaching line from session insights (e.g. dominant distractor type). */
  coachLine?: string | null;
  onPractice: (w: string) => void;
};

export function ReviewQueue({ words, coachLine, onPractice }: Props) {
  if (!words.length) return null;
  return (
    <section className="lex-review-queue overflow-hidden rounded-2xl border-2 border-[color-mix(in_srgb,var(--accent)_25%,var(--border))] bg-[var(--card)] p-5 shadow-[0_10px_36px_color-mix(in_srgb,var(--accent)_7%,transparent)] md:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="min-w-0">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
            Smart practice
          </p>
          <h3 className="font-headline mt-1 flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight text-[var(--text)] md:text-[1.65rem]">
            <span className="text-[1.35em] leading-none" aria-hidden>
              📚
            </span>
            Review queue
          </h3>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[color-mix(in_srgb,var(--muted)_30%,var(--text))] md:text-base">
            Words worth another look — pulled from <strong className="text-[var(--text)]">mastery</strong> and your{" "}
            <strong className="text-[var(--text)]">recent weak spots</strong>. Tap a card to open it in Play.
          </p>
        </div>
        <div
          className="hidden shrink-0 rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,var(--card-elevated))] px-4 py-3 text-center sm:block"
          aria-hidden
        >
          <div className="text-2xl font-bold text-[var(--accent)]">{words.length}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">queued</div>
        </div>
      </div>

      {coachLine ? (
        <div className="mb-5 flex gap-3 rounded-xl border-2 border-[color-mix(in_srgb,var(--gold)_45%,var(--border))] bg-[color-mix(in_srgb,var(--gold-bg)_88%,var(--card))] p-4 md:p-5">
          <span className="text-2xl leading-none" aria-hidden>
            💡
          </span>
          <p className="min-w-0 text-sm font-semibold leading-relaxed text-[var(--text)] md:text-base">{coachLine}</p>
        </div>
      ) : null}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
        {words.map((w) => (
          <li key={w}>
            <button
              type="button"
              onClick={() => onPractice(w)}
              className="group flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-[color-mix(in_srgb,var(--card-elevated)_85%,var(--accent))] px-3 py-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,var(--card))] hover:shadow-md motion-reduce:transform-none md:py-6"
            >
              <span className="text-lg opacity-80 transition-opacity group-hover:opacity-100" aria-hidden>
                ▶
              </span>
              <span className="font-tamil text-lg font-bold leading-tight text-[var(--accent)] md:text-xl">{w}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] group-hover:text-[var(--accent)]">
                Practice
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
