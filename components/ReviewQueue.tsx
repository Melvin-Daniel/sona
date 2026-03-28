"use client";

import { SummaryFold } from "@/components/SummaryFold";
import { tamilToTanglish } from "@/lib/tanglish";

type Props = {
  words: string[];
  /** Optional coaching line from session insights (e.g. dominant distractor type). */
  coachLine?: string | null;
  onPractice: (w: string) => void;
};

export function ReviewQueue({ words, coachLine, onPractice }: Props) {
  if (!words.length) return null;

  return (
    <SummaryFold
      kicker="Smart practice"
      title="Review queue"
      subtitle="Words from mastery and weak spots — tap a card to open in Play."
      defaultOpen={false}
      meta={
        <div
          className="shrink-0 rounded-2xl bg-[color-mix(in_srgb,var(--accent)_10%,var(--card-elevated))] px-2.5 py-1.5 text-center sm:px-3 sm:py-2"
          aria-hidden
        >
          <div className="text-lg font-bold text-[var(--accent)] sm:text-xl">{words.length}</div>
          <div className="text-[8px] font-bold uppercase tracking-wider text-[var(--muted)] sm:text-[9px]">queued</div>
        </div>
      }
    >
      {coachLine ? (
        <div className="mb-4 flex gap-3 rounded-2xl border-2 border-[color-mix(in_srgb,var(--gold)_45%,var(--border))] bg-[color-mix(in_srgb,var(--gold-bg)_88%,var(--card))] p-4 md:p-5">
          <span className="text-2xl leading-none" aria-hidden>
            💡
          </span>
          <p className="min-w-0 text-sm font-semibold leading-relaxed text-[var(--text)] md:text-base">{coachLine}</p>
        </div>
      ) : null}

      <ul className="grid gap-4 pt-1 sm:grid-cols-2">
        {words.map((w) => {
          const rom = tamilToTanglish(w).trim();
          return (
            <li key={w}>
              <button
                type="button"
                onClick={() => onPractice(w)}
                className="lex-review-queue-card flex min-h-[118px] w-full gap-4 rounded-2xl border-2 border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-[color-mix(in_srgb,var(--card-elevated)_88%,var(--accent))] p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,var(--card))] hover:shadow-md motion-reduce:transform-none md:min-h-[128px] md:p-5"
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_14%,var(--card))] text-2xl shadow-sm ring-2 ring-[color-mix(in_srgb,var(--accent)_28%,transparent)] md:h-[4.25rem] md:w-[4.25rem] md:text-[2rem]"
                  aria-hidden
                >
                  📖
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-tamil text-lg font-bold leading-tight text-[var(--text)] md:text-xl">{w}</span>
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--accent)]">
                      Practice
                    </span>
                  </div>
                  {rom ? (
                    <p className="mt-1.5 font-body text-sm font-medium text-[color-mix(in_srgb,var(--muted)_30%,var(--text))]">
                      ({rom})
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-medium text-[var(--muted)]">Tap to load in Play →</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </SummaryFold>
  );
}
