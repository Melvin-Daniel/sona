"use client";

import type { LexifydGameMode } from "@/lib/types";

export type RunRecapData = {
  mode: LexifydGameMode;
  words: string[];
  runScore: number;
  xpGained: number;
  grade: "S" | "A" | "B" | "C";
  bestStreak: number;
  runSeconds: number;
};

function gradeFromScore(score: number, rounds: number): RunRecapData["grade"] {
  if (rounds <= 0) return "C";
  const avg = score / rounds;
  if (avg >= 220) return "S";
  if (avg >= 160) return "A";
  if (avg >= 100) return "B";
  return "C";
}

export function buildRunRecap(
  mode: LexifydGameMode,
  words: string[],
  runScore: number,
  xpGained: number,
  bestStreak: number,
  runSeconds: number,
  totalRounds: number
): RunRecapData {
  return {
    mode,
    words,
    runScore,
    xpGained,
    grade: gradeFromScore(runScore, Math.max(1, totalRounds)),
    bestStreak,
    runSeconds,
  };
}

type Props = {
  data: RunRecapData | null;
  onClose: () => void;
  onSaveLeaderboard?: () => void;
};

export function RunRecap({ data, onClose, onSaveLeaderboard }: Props) {
  if (!data) return null;

  const modeLabel =
    data.mode === "arcade" ? "Arcade" : data.mode === "boss" ? "Boss" : "Run";

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="recap-title"
    >
      <div className="lex-card max-h-[90vh] w-full max-w-md overflow-y-auto p-6 shadow-2xl">
        <h2 id="recap-title" className="font-display text-xl font-bold text-[var(--text)]">
          {modeLabel} complete
        </h2>
        <p className="mt-2 font-display text-2xl font-black text-[var(--accent)]">Grade {data.grade}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted-2)]">Run score</dt>
            <dd className="font-tamil text-[var(--text)]">{data.runScore}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted-2)]">XP gained</dt>
            <dd className="text-[var(--accent)]">+{data.xpGained}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted-2)]">Best streak</dt>
            <dd className="text-[var(--success)]">{data.bestStreak}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted-2)]">Time</dt>
            <dd className="text-[var(--muted)]">{data.runSeconds}s</dd>
          </div>
        </dl>
        <div className="mt-4">
          <p className="text-xs text-[var(--muted-2)]">Words</p>
          <p className="mt-1 font-tamil text-sm text-[var(--text)]">{data.words.join(" · ")}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="lex-btn-primary rounded-lg px-4 py-2 text-sm"
          >
            Close
          </button>
          {onSaveLeaderboard && (
            <button
              type="button"
              onClick={onSaveLeaderboard}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--card)_80%,transparent)]"
            >
              Save to local leaderboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
