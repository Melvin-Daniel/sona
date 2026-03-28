"use client";

import { MAIN_NAV, type AppTabId } from "@/lib/mainNav";
import type { PlayStage } from "@/components/seren";

export type { AppTabId } from "@/lib/mainNav";

type Props = {
  active: AppTabId;
  playStage: PlayStage;
  onChange: (id: AppTabId) => void;
  onPlayHome: () => void;
  onPlayModes: () => void;
  comfort?: boolean;
};

/** Compact horizontal tabs — tablet / narrow layouts (Play + Modes + tabs) */
export function AppTabs({
  active,
  playStage,
  onChange,
  onPlayHome,
  onPlayModes,
  comfort = false,
}: Props) {
  const playOn = active === "play" && (playStage === "home" || playStage === "game");
  const modesOn = active === "play" && playStage === "modes";

  return (
    <nav
      className={`lex-card mb-5 hidden flex-wrap gap-1.5 p-1.5 sm:flex md:hidden ${comfort ? "lex-app-tabs-comfort" : ""}`}
      aria-label="Main sections"
    >
      <button
        type="button"
        onClick={onPlayHome}
        className={`min-h-[44px] flex-1 rounded-xl px-2 py-2 text-ui font-semibold transition-colors duration-200 ${
          playOn ? "lex-nav-item-active" : "text-[var(--muted)] lex-mob-tab-idle"
        }`}
        title="Home dashboard"
      >
        Play
      </button>
      <button
        type="button"
        onClick={onPlayModes}
        className={`min-h-[44px] flex-1 rounded-xl px-2 py-2 text-ui font-semibold transition-colors duration-200 ${
          modesOn ? "lex-nav-item-active" : "text-[var(--muted)] lex-mob-tab-idle"
        }`}
        title="Pathways & custom load"
      >
        Modes
      </button>
      {MAIN_NAV.filter((t) => t.id !== "play").map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`min-h-[44px] flex-1 rounded-xl px-2 py-2 text-ui font-semibold transition-colors duration-200 ${
            active === t.id ? "lex-nav-item-active" : "text-[var(--muted)] lex-mob-tab-idle"
          }`}
          title={t.hint}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
