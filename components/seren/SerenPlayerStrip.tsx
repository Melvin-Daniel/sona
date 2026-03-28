"use client";

import { xpToNextLevel } from "@/lib/progression";
import { DAILY_QUEST_WORD_COUNT } from "@/lib/seed";

type Props = {
  nickname: string;
  onNicknameChange: (n: string) => void;
  streakDays: number;
  xp: number;
  dailyQualifiedToday: boolean;
  /** 0-based index during an active daily run */
  dailyRunWordIndex?: number;
  runActiveDaily: boolean;
  comfort?: boolean;
};

export function SerenPlayerStrip({
  nickname,
  onNicknameChange,
  streakDays,
  xp,
  dailyQualifiedToday,
  dailyRunWordIndex,
  runActiveDaily,
  comfort = false,
}: Props) {
  const { level, currentStart, nextAt } = xpToNextLevel(xp);
  const span = Math.max(1, nextAt - currentStart);
  const levelPct = Math.min(100, Math.round(((xp - currentStart) / span) * 100));

  let dailyPct = 0;
  if (dailyQualifiedToday) dailyPct = 100;
  else if (runActiveDaily && dailyRunWordIndex != null) {
    dailyPct = Math.min(100, Math.round(((dailyRunWordIndex + 1) / DAILY_QUEST_WORD_COUNT) * 100));
  }

  const initial = nickname.trim().slice(0, 1) || "அ";

  return (
    <section
      className={`mb-6 flex flex-wrap items-center gap-4 border-b-[1.5px] border-[var(--border)] bg-[var(--card)] py-3 md:gap-5 md:py-3.5 ${
        comfort
          ? "-mx-5 px-5 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16 xl:-mx-20 xl:px-20 2xl:-mx-24 2xl:px-24 lex-player-strip-comfort"
          : "-mx-5 px-5 md:-mx-10 md:px-7 lg:-mx-14 lg:px-8"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
        <div
          className="lex-p-av flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#c8bfaa] bg-[#2e2e22] font-tamil text-[13px] font-bold text-[#f0ebe0] md:h-10 md:w-10"
          aria-hidden
        >
          {initial}
        </div>
        <div className="min-w-0">
          <label className="block">
            <span className="sr-only">Display name</span>
            <input
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value)}
              className="lex-p-name-input w-full max-w-[200px] border-0 bg-transparent font-body text-sm font-semibold text-[var(--text)] outline-none placeholder:text-[var(--muted)] md:max-w-[240px] md:text-[15px]"
              placeholder="Scholar_42"
            />
          </label>
          {!nickname.trim() && (
            <p className="lex-p-hint font-body text-[11px] text-[var(--muted)]">Tap to set your name</p>
          )}
          <p className="lex-p-sub mt-0.5 hidden font-body text-[11px] text-[var(--muted)] sm:block">
            Level {level} · Polyglot path
          </p>
        </div>
      </div>

      <div className="lex-streak-pill flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--gold)_35%,var(--border))] bg-[var(--gold-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--gold)] md:px-3 md:text-[13px]">
        <span aria-hidden>🔥</span>
        {streakDays}
      </div>

      <div className="lex-daily-wrap min-w-0 flex-1 md:max-w-[220px] lg:max-w-xs">
        <div className="lex-daily-lbl mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          <span>Daily quest</span>
          <span className="tabular-nums text-[var(--text)]">{dailyPct}%</span>
        </div>
        <div className="lex-bar-track h-[7px] w-full overflow-hidden rounded-full border border-[var(--border)] bg-[#e8e2d4]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${dailyPct}%` }}
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-right">
          <div className="lex-xp-lbl mb-1 flex items-center justify-end gap-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
            <span>XP</span>
            <span className="tabular-nums text-[var(--text)]">{xp.toLocaleString()}</span>
          </div>
          <div className="lex-xp-bar-wrap lex-bar-track h-[7px] w-[120px] overflow-hidden rounded-full border border-[var(--border)] bg-[#e8e2d4] md:w-[140px]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${levelPct}%` }}
            />
          </div>
        </div>
        <div className="lex-lvl-badge rounded-full bg-[var(--text)] px-3 py-1.5 font-body text-xs font-semibold text-[#f0ebe0] md:text-[13px]">
          Level {level}
        </div>
      </div>

      <div className="w-full basis-full border-t border-[var(--border)] pt-3 sm:hidden">
        <div className="lex-daily-lbl mb-1 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
          <span>Level progress</span>
          <span>{levelPct}%</span>
        </div>
        <div className="lex-bar-track h-1.5 overflow-hidden rounded-full bg-[#e8e2d4]">
          <div className="h-full rounded-full bg-[var(--success)]" style={{ width: `${levelPct}%` }} />
        </div>
      </div>
    </section>
  );
}
