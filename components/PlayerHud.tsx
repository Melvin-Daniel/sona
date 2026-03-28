"use client";

import { xpToNextLevel } from "@/lib/progression";
import { DAILY_QUEST_WORD_COUNT } from "@/lib/seed";

type Props = {
  nickname: string;
  onNicknameChange: (n: string) => void;
  streakDays: number;
  /** Re-render when xp changes */
  xp: number;
  dailyQuest?: {
    qualifiedToday: boolean;
    /** 1-based word index in an active daily run */
    activeWordIndex?: number;
  };
};

export function PlayerHud({
  nickname,
  onNicknameChange,
  streakDays,
  xp,
  dailyQuest,
}: Props) {
  const { level, currentStart, nextAt } = xpToNextLevel(xp);
  const span = Math.max(1, nextAt - currentStart);
  const pct = Math.min(100, Math.round(((xp - currentStart) / span) * 100));

  return (
    <div className="lex-card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-3 text-ui text-[var(--muted)]">
          <span className="shrink-0 font-medium">Player</span>
          <input
            className="lex-input max-w-[180px]"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
          />
        </label>
        <div
          className="flex min-h-[44px] items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-4 py-2 text-ui font-medium text-[var(--text)]"
          title="Complete today’s daily quest to extend your streak"
        >
          <span aria-hidden className="text-[var(--accent)]">
            ◆
          </span>
          <span>{streakDays} day streak</span>
        </div>
        {dailyQuest && (
          <div
            className="text-ui text-[var(--muted)]"
            title="Daily quest — five distinct words per calendar day"
          >
            Daily:{" "}
            <span className="font-medium text-[var(--accent)]">
              {dailyQuest.qualifiedToday
                ? "quest done ✓"
                : dailyQuest.activeWordIndex != null
                  ? `quest word ${dailyQuest.activeWordIndex}/${DAILY_QUEST_WORD_COUNT}`
                  : `quest not started (${DAILY_QUEST_WORD_COUNT} words)`}
            </span>
          </div>
        )}
      </div>
      <div className="min-w-[220px] flex-1 sm:max-w-md">
        <div className="flex justify-between text-ui-sm font-medium text-[var(--muted-2)]">
          <span>Level {level}</span>
          <span>
            {xp} XP · next {nextAt}
          </span>
        </div>
        <div
          className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--accent-ink)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
