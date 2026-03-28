"use client";

import type { LexifydGameMode } from "@/lib/types";
import { DAILY_QUEST_WORD_COUNT } from "@/lib/seed";

export type RunHud = {
  score: number;
  streak: number;
  bestStreak: number;
  combo: number;
  runSeconds: number;
};

type Props = {
  mode: LexifydGameMode;
  onModeChange: (m: LexifydGameMode) => void;
  onDailyQuestStart: () => void;
  onArcadeStart: () => void;
  onBossStart: () => void;
  /** After mode is selected, open preview splash (Serene Modes). If omitted, start buttons call the start handlers directly. */
  onPathwayPreview?: (m: LexifydGameMode) => void;
  hud: RunHud;
  showStats: boolean;
  /** Stitch “Serene Scholar” mode tiles */
  visualVariant?: "default" | "serene";
  /** Larger pathway tiles & actions (Modes screen) */
  comfort?: boolean;
};

const MODE_GRID: {
  id: LexifydGameMode;
  label: string;
  icon: string;
  fill?: boolean;
  description: string;
}[] = [
  {
    id: "custom",
    label: "Custom",
    icon: "tune",
    description:
      "Your word, your pace — pick from the list or type Tamil, then Load challenge and clear every sense.",
  },
  {
    id: "daily",
    label: "Daily",
    icon: "today",
    fill: true,
    description: `${DAILY_QUEST_WORD_COUNT} words in one run — finish the set to push your streak forward.`,
  },
  {
    id: "arcade",
    label: "Arcade",
    icon: "joystick",
    description: "Speed gauntlet: 5 words, timer on — chain correct answers for combo glory.",
  },
  {
    id: "boss",
    label: "Boss",
    icon: "bolt",
    description: "Elite run: 7 harder words, ruthless clock — ஒளி hints are locked. Good luck.",
  },
];

/** Compact tooltip under default mode chips. */
const PATHWAY_TOOLTIP_CHIP =
  "pointer-events-none absolute left-1/2 top-full z-[60] mt-2 w-[min(19rem,calc(100vw-2rem))] -translate-x-1/2 opacity-0 translate-y-1 scale-[0.98] transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100";

function PathwayBriefingSerene({ description }: { description: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute bottom-full left-1/2 z-[70] mb-3 w-[min(22rem,calc(100vw-1.25rem))] -translate-x-1/2 opacity-0 translate-y-2 scale-[0.96] transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:translate-y-0"
    >
      <span className="relative block rounded-2xl border-2 border-[color-mix(in_srgb,var(--accent)_50%,var(--border))] bg-gradient-to-b from-[var(--card)] to-[color-mix(in_srgb,var(--card-elevated)_88%,var(--card))] px-4 py-3.5 text-left shadow-[0_14px_44px_rgba(21,56,56,0.18)] ring-4 ring-[color-mix(in_srgb,var(--accent)_14%,transparent)]">
        <span className="flex items-center gap-2 font-body text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--accent)]">
          <span className="material-symbols-outlined text-base" aria-hidden>
            military_tech
          </span>
          Path briefing
        </span>
        <span className="mt-2.5 block text-sm font-semibold leading-snug text-[var(--text)] lg:text-base lg:leading-relaxed">
          {description}
        </span>
      </span>
    </span>
  );
}

export function GameShell({
  mode,
  onModeChange,
  onDailyQuestStart,
  onArcadeStart,
  onBossStart,
  onPathwayPreview,
  hud,
  showStats,
  visualVariant = "default",
  comfort = false,
}: Props) {
  const serene = visualVariant === "serene";
  const shellCls = comfort && serene ? "lex-game-shell-comfort" : "";
  const preview = onPathwayPreview;
  /** Wall-clock run seconds; Daily has no per-round countdown, so elapsed time is shown. Arcade/Boss use the bar above the card. */
  const showRunWallClock = mode === "daily";

  return (
    <div className={`space-y-5 ${shellCls}`}>
      {serene ? (
        <div className="mb-2">
          <h3 className="lex-pathway-heading font-headline text-xl font-bold text-[var(--accent)] lg:text-2xl">
            Select pathway
          </h3>
        </div>
      ) : null}

      {serene ? (
        <div className="lex-pathway-grid grid grid-cols-2 gap-3 overflow-visible sm:grid-cols-4 lg:gap-4">
          {MODE_GRID.map(({ id: m, label, icon, fill, description }) => {
            const on = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onModeChange(m);
                  preview?.(m);
                }}
                aria-label={`${label}. ${description}`}
                className={`lex-pathway-tile group relative overflow-visible rounded-xl border-2 p-4 text-left transition-all duration-200 lg:p-6 ${
                  on
                    ? "border-[var(--accent)] bg-[#1f4a3a] text-[#f0ebe0] shadow-[0_8px_28px_rgba(31,74,58,0.22)]"
                    : "border-transparent bg-[var(--card-elevated)] hover:border-[color-mix(in_srgb,var(--accent)_28%,transparent)] hover:shadow-md motion-reduce:hover:shadow-none"
                }`}
              >
                <span
                  className={`lex-pathway-icon material-symbols-outlined mb-2 block text-2xl transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100 lg:mb-3 lg:text-3xl ${on ? "text-[#f0ebe0]" : "text-[var(--accent)]"}`}
                  style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {icon}
                </span>
                <span
                  className={`lex-pathway-label block text-base font-bold lg:text-lg ${on ? "text-[#f0ebe0]" : "text-[var(--accent)]"}`}
                >
                  {label}
                </span>
                <PathwayBriefingSerene description={description} />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_70%,transparent)] p-4">
          <span className="text-ui-sm font-medium text-[var(--muted-2)]">Mode</span>
          {MODE_GRID.map(({ id: m, label, description }) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                onModeChange(m);
                preview?.(m);
              }}
              aria-label={`${label}. ${description}`}
              className={`group relative ${mode === m ? "lex-btn-segment lex-nav-item-active" : "lex-btn-segment"}`}
            >
              {label}
              <span role="tooltip" className={PATHWAY_TOOLTIP_CHIP}>
                <span className="block rounded-xl border-2 border-[color-mix(in_srgb,var(--accent)_40%,var(--border))] bg-[var(--card)] px-3 py-2.5 text-left text-sm font-semibold leading-snug text-[var(--text)] shadow-lg ring-2 ring-[color-mix(in_srgb,var(--accent)_10%,transparent)]">
                  <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-[var(--accent)]">
                    Briefing
                  </span>
                  {description}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="lex-pathway-actions flex flex-wrap gap-2">
        {mode === "daily" && (
          <button
            type="button"
            onClick={() => (preview ? preview("daily") : onDailyQuestStart())}
            className="lex-btn-secondary border-[color-mix(in_srgb,var(--accent)_42%,var(--border))] font-semibold text-[var(--accent)]"
          >
            Start today&apos;s quest ({DAILY_QUEST_WORD_COUNT} words)
          </button>
        )}
        {mode === "arcade" && (
          <button
            type="button"
            onClick={() => (preview ? preview("arcade") : onArcadeStart())}
            className="lex-btn-secondary border-[color-mix(in_srgb,var(--success)_40%,var(--border))] font-semibold text-[var(--success)]"
          >
            Start run (5 words)
          </button>
        )}
        {mode === "boss" && (
          <button
            type="button"
            onClick={() => (preview ? preview("boss") : onBossStart())}
            className="lex-btn-secondary border-[color-mix(in_srgb,var(--danger)_42%,var(--border))] font-semibold text-[var(--danger)]"
          >
            Boss gauntlet (7)
          </button>
        )}
      </div>

      {showStats && (
        <div
          className={`lex-run-stats-grid grid grid-cols-2 gap-3 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card)_65%,transparent)] p-4 ${
            showRunWallClock ? "sm:grid-cols-5" : "sm:grid-cols-4"
          }`}
        >
          <div>
            <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">Score</p>
            <p className="mt-1 font-display text-xl font-bold text-[var(--accent)]">{hud.score}</p>
          </div>
          <div>
            <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">Streak</p>
            <p className="mt-1 font-display text-xl font-bold text-[var(--success)]">{hud.streak}</p>
          </div>
          <div>
            <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">Combo</p>
            <p className="mt-1 font-display text-xl font-bold text-[var(--muted)]">×{hud.combo || 1}</p>
          </div>
          <div>
            <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">Best streak</p>
            <p className="mt-1 font-display text-xl font-bold text-[var(--accent)]">{hud.bestStreak}</p>
          </div>
          {showRunWallClock ? (
            <div>
              <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">Run time</p>
              <p className="mt-1 font-display text-xl font-bold text-[var(--text)]">{hud.runSeconds}s</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
