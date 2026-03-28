"use client";

import type { AppTabId } from "@/lib/mainNav";
import { MAIN_NAV } from "@/lib/mainNav";
import type { PlayStage } from "./SerenSidebar";

type Props = {
  tab: AppTabId;
  playStage: PlayStage;
  onTab: (id: AppTabId) => void;
  onPlayHome: () => void;
  onPlayModes: () => void;
};

export function SerenMobileNav({ tab, playStage, onTab, onPlayHome, onPlayModes }: Props) {
  const playOn = tab === "play" && (playStage === "home" || playStage === "game");
  const modesOn = tab === "play" && playStage === "modes";

  const TAB_ICONS: Record<AppTabId, string> = {
    play: "play_circle",
    summary: "description",
    explore: "explore",
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-between gap-0 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] px-1 py-2 backdrop-blur-xl md:hidden"
      aria-label="Mobile sections"
    >
      <button
        type="button"
        onClick={onPlayHome}
        className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1 ${
          playOn ? "font-bold text-[var(--accent)]" : "text-[var(--muted)] opacity-80"
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={playOn ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          play_circle
        </span>
        <span className="max-w-full truncate text-[9px] font-bold uppercase tracking-tighter">Play</span>
      </button>

      <button
        type="button"
        onClick={onPlayModes}
        className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1 ${
          modesOn ? "font-bold text-[var(--accent)]" : "text-[var(--muted)] opacity-80"
        }`}
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={modesOn ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          dashboard
        </span>
        <span className="max-w-full truncate text-[9px] font-bold uppercase tracking-tighter">Modes</span>
      </button>

      {MAIN_NAV.filter((t) => t.id !== "play").map((t) => {
        const on = tab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onTab(t.id)}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1 ${
              on ? "font-bold text-[var(--accent)]" : "text-[var(--muted)] opacity-80"
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={on ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {TAB_ICONS[t.id]}
            </span>
            <span className="max-w-full truncate text-[9px] font-bold uppercase tracking-tighter">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
