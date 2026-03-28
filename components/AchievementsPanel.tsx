"use client";

import { ACHIEVEMENTS, type AchievementId, loadUnlocked } from "@/lib/achievements";

const BADGE: Record<AchievementId, string> = {
  first_perfect: "🌟",
  polyglot_trainee: "🌍",
  streak_3: "🔥",
  streak_10: "🏆",
  boss_clear: "🐉",
  arcade_clear: "⚡",
  drag_purist_10: "✨",
};

export function AchievementsPanel({ version = 0 }: { version?: number }) {
  const unlocked = loadUnlocked();
  void version;

  return (
    <section className="lex-achievements-panel overflow-hidden rounded-2xl border-2 border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[color-mix(in_srgb,var(--card)_96%,var(--gold-bg))] p-5 shadow-[0_10px_36px_color-mix(in_srgb,var(--accent)_8%,transparent)] md:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
            Your milestones
          </p>
          <h3 className="font-headline mt-1 text-2xl font-bold tracking-tight text-[var(--text)] md:text-[1.65rem]">
            Achievements
          </h3>
          <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-[color-mix(in_srgb,var(--muted)_35%,var(--text))]">
            Earn badges as you master polysemy — perfect rounds, streaks, runs, and drag skills.
          </p>
        </div>
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--gold)_22%,var(--card))] text-3xl shadow-inner md:h-16 md:w-16 md:text-4xl"
          aria-hidden
        >
          🎖️
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const ok = unlocked.has(a.id);
          const emoji = BADGE[a.id];
          return (
            <li key={a.id}>
              <div
                className={`lex-achievement-card flex min-h-[120px] gap-4 rounded-2xl border-2 p-4 transition-shadow md:min-h-[128px] md:p-5 ${
                  ok
                    ? "border-[color-mix(in_srgb,var(--success)_45%,var(--border))] bg-[color-mix(in_srgb,var(--success)_12%,var(--card))] shadow-[0_4px_0_color-mix(in_srgb,var(--success)_35%,transparent)]"
                    : "border-[var(--border)] bg-[color-mix(in_srgb,var(--card-elevated)_90%,var(--bg))] opacity-[0.92]"
                }`}
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl md:h-[4.25rem] md:w-[4.25rem] md:text-[2.15rem] ${
                    ok
                      ? "bg-[color-mix(in_srgb,var(--success)_18%,var(--card))] shadow-sm ring-2 ring-[color-mix(in_srgb,var(--success)_40%,transparent)]"
                      : "bg-[var(--border-muted)] grayscale-[0.35]"
                  }`}
                  aria-hidden
                >
                  {emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-headline text-lg font-bold leading-tight text-[var(--text)] md:text-xl">
                      {a.title}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        ok
                          ? "bg-[color-mix(in_srgb,var(--success)_28%,transparent)] text-[var(--success)]"
                          : "bg-[var(--border-muted)] text-[var(--muted)]"
                      }`}
                    >
                      {ok ? "✓ Unlocked" : "🔒 Locked"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-snug text-[color-mix(in_srgb,var(--muted)_25%,var(--text))] md:text-[15px]">
                    {a.desc}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
