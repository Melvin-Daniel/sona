"use client";

import type { AppTabId } from "@/lib/mainNav";
import { MAIN_NAV } from "@/lib/mainNav";

export type PlayStage = "home" | "modes" | "game";

const TAB_ICONS: Record<AppTabId, string> = {
  play: "play_circle",
  summary: "description",
  explore: "explore",
};

function sidebarAvatarLetter(nick: string): string {
  const t = nick.trim();
  if (!t) return "அ";
  const m = t.match(/[\u0B80-\u0BFF]/);
  return m ? m[0]! : t[0]!.toUpperCase();
}

type Props = {
  tab: AppTabId;
  playStage: PlayStage;
  nickname: string;
  streakDays: number;
  dailyQualifiedToday: boolean;
  dailyWordsLeft: number;
  onTab: (id: AppTabId) => void;
  onPlayHome: () => void;
  onPlayModes: () => void;
  onStartDailyLesson: () => void;
  onSignOut: () => void;
};

export function SerenSidebar({
  tab,
  playStage,
  nickname,
  streakDays,
  dailyQualifiedToday,
  dailyWordsLeft,
  onTab,
  onPlayHome,
  onPlayModes,
  onStartDailyLesson,
  onSignOut,
}: Props) {
  const playNavActive = tab === "play" && (playStage === "home" || playStage === "game");
  const modesNavActive = tab === "play" && playStage === "modes";
  const displayNick = nickname.trim() || "Scholar";

  const ctaSmall = dailyQualifiedToday
    ? "Done today ✦"
    : dailyWordsLeft > 0
      ? `${dailyWordsLeft} word${dailyWordsLeft === 1 ? "" : "s"} left`
      : "Daily words · extend streak";

  const navBtn = (active: boolean) =>
    `lex-sidebar-nav-btn flex items-center gap-3 rounded-xl py-3 pl-4 pr-3 text-left text-[15px] transition-all duration-200 motion-reduce:transition-none ${
      active
        ? "lex-sidebar-nav-btn--active border-l-[3px] border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] font-bold text-[var(--accent)] shadow-sm"
        : "border-l-[3px] border-transparent font-semibold text-[color-mix(in_srgb,var(--text)_55%,var(--muted))] hover:bg-[color-mix(in_srgb,var(--accent)_6%,var(--border-muted))] hover:text-[var(--text)]"
    }`;

  const navIcon = (active: boolean) =>
    `material-symbols-outlined lex-sidebar-nav-ic shrink-0 text-[22px] leading-none ${active ? "opacity-100" : "opacity-80"}`;

  return (
    <nav
      className="lex-sidebar fixed left-0 top-0 z-50 hidden h-full w-[15rem] flex-col overflow-hidden md:flex lg:w-64"
      aria-label="Main navigation"
    >
      <div className="lex-sidebar-brand px-5 pb-6 pt-1 md:px-6">
        <h1 className="font-headline text-[1.65rem] font-bold leading-[1.1] tracking-tight text-[var(--text)] md:text-[1.75rem]">
          Lexifyd
        </h1>
        <p className="lex-sidebar-tagline mt-2 font-body text-[11px] font-bold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--accent)_72%,var(--muted))]">
          The Mindful Sanctuary
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 md:px-3">
        <button type="button" onClick={onPlayHome} className={navBtn(playNavActive)}>
          <span
            className={navIcon(playNavActive)}
            style={playNavActive ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : undefined}
          >
            play_circle
          </span>
          <span>Play</span>
        </button>

        <button type="button" onClick={onPlayModes} className={navBtn(modesNavActive)}>
          <span
            className={navIcon(modesNavActive)}
            style={modesNavActive ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : undefined}
          >
            dashboard
          </span>
          <span>Modes</span>
        </button>

        {MAIN_NAV.filter((t) => t.id !== "play").map((t) => {
          const on = tab === t.id;
          return (
            <button key={t.id} type="button" title={t.hint} onClick={() => onTab(t.id)} className={navBtn(on)}>
              <span
                className={navIcon(on)}
                style={on ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : undefined}
              >
                {TAB_ICONS[t.id]}
              </span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="lex-sidebar-foot mt-auto flex flex-col gap-3.5 border-t border-[color-mix(in_srgb,var(--border)_80%,var(--accent))] px-4 pb-5 pt-5 md:px-5">
        <div className="flex items-center gap-3 px-0.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-tamil text-[15px] font-bold text-[var(--accent-ink)] shadow-md ring-2 ring-[color-mix(in_srgb,var(--accent)_35%,transparent)]">
            {sidebarAvatarLetter(displayNick)}
          </div>
          <div className="min-w-0">
            <div className="truncate font-body text-sm font-bold text-[var(--text)]">{displayNick}</div>
            <div className="font-body text-xs font-semibold text-[color-mix(in_srgb,var(--muted)_70%,var(--accent))]">
              🔥 {streakDays > 0 ? `${streakDays} day streak` : "Build your streak"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onStartDailyLesson}
          className="w-full rounded-xl bg-[var(--accent)] px-4 py-4 text-left font-body text-[14px] font-bold leading-snug text-[var(--accent-ink)] shadow-[0_6px_20px_color-mix(in_srgb,var(--accent)_32%,transparent)] transition-all hover:bg-[var(--accent-hover)] hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--accent)_38%,transparent)] motion-reduce:transition-none"
        >
          Start today&apos;s quest
          <small className="mt-1.5 block text-[12px] font-semibold opacity-85">{ctaSmall}</small>
        </button>
        <div className="flex flex-col gap-1 pb-0.5">
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-sm font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--border-muted)] hover:text-[var(--text)]"
          >
            <span className="material-symbols-outlined text-[20px] opacity-85">logout</span>
            <span>Sign out</span>
          </button>
          <span className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-[var(--muted)] opacity-75">
            <span className="material-symbols-outlined text-[20px] opacity-80">settings</span>
            <span>Settings</span>
          </span>
        </div>
      </div>
    </nav>
  );
}
