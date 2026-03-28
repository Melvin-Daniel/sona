"use client";

import type { SessionHistoryEntry } from "@/lib/sessionHistory";
import { isDetailedSession } from "@/lib/sessionHistory";
import { taxonomyLabel } from "@/lib/taxonomyLabels";
import type { OptionRole } from "@/lib/types";
import Link from "next/link";

type Props = {
  entry: SessionHistoryEntry;
  onBack: () => void;
  onPracticeWord: (word: string) => void;
  /** When set, shows a link to the bookmarkable session URL (e.g. from Summary tab). */
  bookmarkHref?: string;
};

function roleLabel(role: string): string {
  if (role === "correct") return "Correct";
  return taxonomyLabel(role as OptionRole);
}

export function SessionDetailPanel({ entry, onBack, onPracticeWord, bookmarkHref }: Props) {
  const pct = entry.total ? Math.round((entry.correct / entry.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="lex-btn-secondary min-h-[48px] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
        >
          ← Back to list
        </button>
        <button
          type="button"
          onClick={() => onPracticeWord(entry.word)}
          className="lex-btn-primary"
        >
          Practice this word
        </button>
        {bookmarkHref ? (
          <Link
            href={bookmarkHref}
            className="text-ui font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Open in own page
          </Link>
        ) : null}
      </div>

      <div className="lex-card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-3xl font-semibold text-[var(--text)]">
            <span className="font-tamil">{entry.word}</span>
          </h2>
          <p className="text-ui text-[var(--muted)]">{new Date(entry.at).toLocaleString()}</p>
        </div>
        {isDetailedSession(entry) && entry.mode && (
          <p className="mt-2 text-ui-sm font-semibold uppercase tracking-wide text-[var(--accent)]">{entry.mode}</p>
        )}
        <p className="mt-4 font-display text-2xl font-bold text-[var(--accent)]">
          {entry.correct} / {entry.total}{" "}
          <span className="text-ui-lg font-normal text-[var(--muted)]">({pct}%)</span>
        </p>
      </div>

      {!isDetailedSession(entry) && (
        <div className="lex-card border-dashed p-6 text-ui leading-relaxed text-[var(--muted)]">
          <p className="font-medium text-[var(--text)]">Limited history</p>
          <p className="mt-2">
            This session was saved before per-round logging. Only the score is available. Play the word
            again to capture mistakes, distractor types, and sentences.
          </p>
        </div>
      )}

      {isDetailedSession(entry) && (
        <div className="space-y-4">
          <h3 className="font-display text-display-tight font-semibold text-[var(--text)]">Round-by-round</h3>
          <ol className="space-y-5">
            {entry.rounds.map((round, i) => (
              <li
                key={`${round.senseId}-${i}`}
                className="lex-card border-[var(--border)] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">
                    Round {i + 1}
                  </span>
                  <span
                    className={
                      round.correct ? "text-[var(--success)]" : "text-[var(--warning)]"
                    }
                  >
                    {round.correct ? "Correct" : "Review"}
                  </span>
                </div>
                <p className="mt-2 text-ui text-[var(--muted)]">{round.senseLabel}</p>
                <p className="mt-3 font-tamil text-lg leading-relaxed text-[var(--text)] md:text-xl">
                  {round.sentence}
                </p>
                <p className="mt-3 text-ui-sm text-[var(--muted-2)]">
                  How answered:{" "}
                  <span className="text-[var(--text)]">
                    {round.how === "drag"
                      ? "Meaning drag"
                      : round.how === "mcq"
                        ? "Choice cards (MCQ)"
                        : "Time ran out"}
                  </span>
                </p>

                {!round.correct && (
                  <div className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] p-4 text-ui">
                    <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--danger)]">
                      What happened
                    </p>
                    {round.pickedText != null && (
                      <p className="mt-2 text-[var(--muted)]">
                        Your pick:{" "}
                        <span className="font-tamil text-[var(--text)]">{round.pickedText}</span>
                        {round.pickedRole && round.pickedRole !== "correct" && (
                          <span className="mt-1.5 block text-ui-sm text-[var(--muted-2)]">
                            Trap type: {roleLabel(round.pickedRole)}
                          </span>
                        )}
                      </p>
                    )}
                    {round.how === "timeout" && round.pickedText == null && (
                      <p className="mt-1 text-[var(--muted)]">No answer locked before the timer ended.</p>
                    )}
                    <p className="mt-2 text-[var(--muted)]">
                      Correct fragment:{" "}
                      <span className="font-tamil text-[var(--success)]">{round.correctText}</span>
                    </p>
                    {(round.explainWrongTa || round.explainWrongEn) && (
                      <div className="mt-3 border-t border-[var(--border)] pt-3 text-ui-sm">
                        {round.explainWrongTa && (
                          <p className="font-tamil text-[var(--text)]">{round.explainWrongTa}</p>
                        )}
                        {round.explainWrongEn && (
                          <p className="mt-1 text-[var(--muted-2)]">{round.explainWrongEn}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {round.correct && round.how === "mcq" && round.pickedText != null && (
                  <p className="mt-3 text-ui text-[var(--muted)]">
                    Chosen: <span className="font-tamil text-[var(--text)]">{round.pickedText}</span>
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
