"use client";

import type { LexifydGameMode } from "@/lib/types";
import type { RunHud } from "./GameShell";

type Props = {
  mode: LexifydGameMode;
  word: string;
  roundIndex: number;
  roundTotal: number;
  showRun: boolean;
  hud: RunHud;
  /** e.g. "2/5" for daily quest position */
  runQueueHint?: string;
};

export function StickyPlayHud({
  mode,
  word,
  roundIndex,
  roundTotal,
  showRun,
  hud,
  runQueueHint,
}: Props) {
  return (
    <div className="sticky top-0 z-40 rounded-xl border-[1.5px] border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm md:static md:px-0 md:py-0 md:shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3 text-ui">
        <span className="rounded-md bg-[var(--accent)] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--accent-ink)]">
          {mode}
        </span>
        <span className="font-tamil text-lg text-[var(--text)] md:text-xl">{word || "—"}</span>
        {runQueueHint && (
          <span className="font-medium text-[var(--accent)]">
            Quest {runQueueHint}
          </span>
        )}
        {roundTotal > 0 && (
          <span className="text-[var(--muted)]">
            Round {roundIndex + 1}/{roundTotal}
          </span>
        )}
      </div>
      {showRun && (
        <div className="mt-3 flex flex-wrap gap-4 text-ui-sm text-[var(--muted)]">
          <span>Score {hud.score}</span>
          <span>Streak {hud.streak}</span>
          <span>×{hud.combo || 1}</span>
          {mode === "daily" ? <span>Run {hud.runSeconds}s</span> : null}
        </div>
      )}
    </div>
  );
}
