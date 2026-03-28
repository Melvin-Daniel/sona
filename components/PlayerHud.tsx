"use client";

import { levelProgressSummary } from "@/lib/progression";
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
  const prog = levelProgressSummary(xp);
  const span = Math.max(1, prog.nextLevelAt - prog.currentStart);
  const pct = Math.min(100, Math.round(((xp - prog.currentStart) / span) * 100));

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
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-ui-sm font-medium text-[var(--muted-2)]">
          <span>Level {prog.level}</span>
          <span className="tabular-nums text-[var(--text)]">
            {prog.xp.toLocaleString()} / {prog.nextLevelAt.toLocaleString()} XP
          </span>
        </div>
        <p className="mt-1 text-ui-sm leading-snug text-[var(--muted)]">
          {prog.xpToNext > 0 ? (
            <span className="tabular-nums">
              +{prog.xpToNext.toLocaleString()} XP to Level {prog.nextLevel}
            </span>
          ) : (
            <span>At next level threshold</span>
          )}
        </p>
        <div
          className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--accent-ink)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${prog.xp.toLocaleString()} XP of ${prog.nextLevelAt.toLocaleString()} toward level ${prog.nextLevel}`}
          aria-label={`XP toward level ${prog.nextLevel}: ${prog.xp.toLocaleString()} total, ${prog.xpToNext.toLocaleString()} XP remaining until ${prog.nextLevelAt.toLocaleString()}`}
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
