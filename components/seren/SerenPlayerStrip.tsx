"use client";

import { levelProgressSummary } from "@/lib/progression";
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
  const prog = levelProgressSummary(xp);
  const { level } = prog;
  const span = Math.max(1, prog.nextLevelAt - prog.currentStart);
  const levelPct = Math.min(100, Math.round(((xp - prog.currentStart) / span) * 100));

  let dailyPct = 0;
  if (dailyQualifiedToday) dailyPct = 100;
  else if (runActiveDaily && dailyRunWordIndex != null) {
    dailyPct = Math.min(100, Math.round(((dailyRunWordIndex + 1) / DAILY_QUEST_WORD_COUNT) * 100));
  }

  const initial = nickname.trim().slice(0, 1) || "அ";

  const shell = comfort
    ? "-mx-5 px-4 py-5 md:-mx-12 md:px-6 md:py-6 lg:-mx-16 lg:px-7 lg:py-6 xl:-mx-20 xl:px-8 2xl:-mx-24 2xl:px-9 lex-player-strip-comfort"
    : "-mx-5 px-4 py-4 md:-mx-10 md:px-5 md:py-5 lg:-mx-14 lg:px-6";

  return (
    <section
      className={`mb-6 flex flex-col gap-5 rounded-2xl border-2 border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--card)_92%,var(--gold-bg))] shadow-[0_12px_44px_color-mix(in_srgb,var(--accent)_10%,transparent)] sm:gap-4 ${shell}`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="flex min-w-0 flex-wrap items-center gap-4 sm:gap-5">
          <div
            className="lex-p-av flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[color-mix(in_srgb,var(--accent)_30%,var(--border))] bg-[#2e2e22] font-tamil text-base font-bold text-[#f0ebe0] shadow-inner md:h-14 md:w-14 md:text-lg"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <label className="block">
              <span className="sr-only">Display name</span>
              <input
                value={nickname}
                onChange={(e) => onNicknameChange(e.target.value)}
                className="lex-p-name-input w-full max-w-[min(100%,280px)] border-0 bg-transparent font-headline text-lg font-bold tracking-tight text-[var(--text)] outline-none placeholder:text-[var(--muted)] placeholder:font-normal md:max-w-[320px] md:text-xl"
                placeholder="Scholar_42"
              />
            </label>
            {!nickname.trim() && (
              <p className="lex-p-hint font-body text-xs text-[var(--muted)] md:text-sm">Tap to set your name</p>
            )}
            <p className="lex-p-sub mt-1 font-body text-xs font-semibold text-[color-mix(in_srgb,var(--muted)_45%,var(--text))] md:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden>🎓</span>
                Level {level} · Polyglot path
              </span>
            </p>
            <p className="mt-1.5 font-body text-[11px] leading-snug text-[color-mix(in_srgb,var(--muted)_30%,var(--text))] md:text-xs">
              <span className="font-semibold tabular-nums text-[var(--text)]">
                {prog.xp.toLocaleString()} / {prog.nextLevelAt.toLocaleString()} XP
              </span>
              <span className="mx-1.5 text-[var(--muted)]">·</span>
              {prog.xpToNext > 0 ? (
                <span className="tabular-nums">
                  +{prog.xpToNext.toLocaleString()} XP to Level {prog.nextLevel}
                </span>
              ) : (
                <span>At next level threshold</span>
              )}
            </p>
          </div>

          <div className="lex-streak-pill flex items-center gap-2 rounded-2xl border-2 border-[color-mix(in_srgb,var(--gold)_40%,var(--border))] bg-[color-mix(in_srgb,var(--gold-bg)_90%,var(--card))] px-3.5 py-2 text-sm font-bold text-[var(--gold)] shadow-sm md:px-4 md:text-base">
            <span className="text-lg leading-none" aria-hidden>
              🔥
            </span>
            <span className="tabular-nums">{streakDays}</span>
            <span className="hidden font-body text-xs font-semibold uppercase tracking-wide text-[color-mix(in_srgb,var(--gold)_65%,var(--muted))] sm:inline">
              streak
            </span>
          </div>
        </div>

        <div className="lex-daily-wrap min-w-0 flex-1 lg:max-w-xl">
          <div className="lex-daily-lbl mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] md:text-xs">
              <span className="text-base leading-none" aria-hidden>
                ✦
              </span>
              Daily quest
            </span>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2.5 py-0.5 font-body text-xs font-bold tabular-nums text-[var(--accent)] md:text-sm">
              {dailyPct}%
            </span>
          </div>
          <div className="lex-bar-track h-3 w-full overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--accent)_18%,var(--border))] bg-[#e8e2d4] shadow-inner md:h-3.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[color-mix(in_srgb,var(--success)_55%,var(--accent))] transition-all duration-500"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:ml-auto lg:ml-0">
          <div className="min-w-0 text-right">
            <div className="lex-xp-lbl mb-2 flex flex-wrap items-center justify-end gap-2 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] md:text-xs">
              <span className="flex items-center gap-1">
                <span aria-hidden>⚡</span>
                XP
              </span>
              <span className="tabular-nums text-[var(--text)]">{xp.toLocaleString()}</span>
            </div>
            <div
              className="lex-xp-bar-wrap lex-bar-track h-3 min-w-[min(100vw-4rem,200px)] overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--accent)_18%,var(--border))] bg-[#e8e2d4] shadow-inner sm:min-w-[200px] md:h-3.5 md:min-w-[220px] lg:min-w-[260px]"
              role="progressbar"
              aria-valuenow={levelPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${prog.xp.toLocaleString()} XP of ${prog.nextLevelAt.toLocaleString()} toward level ${prog.nextLevel}`}
              aria-label={`XP toward level ${prog.nextLevel}: ${prog.xp.toLocaleString()} total, ${prog.xpToNext.toLocaleString()} XP remaining until ${prog.nextLevelAt.toLocaleString()}`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[color-mix(in_srgb,var(--gold)_45%,var(--accent))] transition-all duration-500"
                style={{ width: `${levelPct}%` }}
              />
            </div>
          </div>
          <div className="lex-lvl-badge flex items-center gap-2 rounded-2xl bg-[var(--text)] px-4 py-2.5 font-body text-sm font-bold text-[#f0ebe0] shadow-md md:px-5 md:py-3 md:text-base">
            <span aria-hidden>🏅</span>
            Level {level}
          </div>
        </div>
      </div>

      <div className="w-full border-t border-[color-mix(in_srgb,var(--border)_80%,transparent)] pt-4 sm:hidden">
        <div className="lex-daily-lbl mb-2 flex justify-between font-body text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          <span>Level progress</span>
          <span className="tabular-nums text-[var(--text)]">{levelPct}%</span>
        </div>
        <div
          className="lex-bar-track h-2.5 overflow-hidden rounded-full border border-[var(--border)] bg-[#e8e2d4]"
          role="progressbar"
          aria-valuenow={levelPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${prog.xp.toLocaleString()} XP of ${prog.nextLevelAt.toLocaleString()} toward level ${prog.nextLevel}`}
          aria-label={`XP toward level ${prog.nextLevel}: ${prog.xp.toLocaleString()} total, ${prog.xpToNext.toLocaleString()} XP remaining until ${prog.nextLevelAt.toLocaleString()}`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--success)] to-[color-mix(in_srgb,var(--accent)_40%,var(--success))]"
            style={{ width: `${levelPct}%` }}
          />
        </div>
      </div>
    </section>
  );
}
