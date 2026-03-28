"use client";

import { resumeAudioContext } from "@/lib/sounds";
import type { AppTabId } from "@/lib/mainNav";

const TITLES: Record<AppTabId, { kicker: string; title: string; desc: string }> = {
  play: {
    kicker: "Polysemy challenge",
    title: "The Dual Paths",
    desc: "Context-aware Tamil polysemy — play modes, then explore the semantic graph for your lemma.",
  },
  summary: {
    kicker: "Your journey",
    title: "Scholar's Summary",
    desc: "Sessions, accuracy, and weak spots — learn where to focus next.",
  },
  explore: {
    kicker: "Semantic web",
    title: "Explore meanings",
    desc: "Visualize senses and collocations for the lemma you have loaded.",
  },
};

type Props = {
  tab: AppTabId;
  onDemo: () => void;
  onSignOut?: () => void;
  soundEnabled: boolean;
  onSoundToggle: (on: boolean) => void;
  /** Larger type & controls on Play home / Modes */
  comfort?: boolean;
};

export function SerenPlayHeader({
  tab,
  onDemo,
  onSignOut,
  soundEnabled,
  onSoundToggle,
  comfort = false,
}: Props) {
  const { kicker, title, desc } = TITLES[tab];

  return (
    <header
      className={`sticky top-0 z-40 mb-2 flex flex-wrap items-start justify-between gap-4 border-b-[1.5px] border-[var(--border)] bg-[var(--card)] py-3.5 shadow-sm md:py-4 ${
        comfort
          ? "-mx-5 px-5 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16 xl:-mx-20 xl:px-20 2xl:-mx-24 2xl:px-24 lex-header-comfort"
          : "-mx-5 px-5 md:-mx-10 md:px-7 lg:-mx-14 lg:px-8"
      }`}
    >
      <div className="min-w-0 flex-1 pr-2">
        <span className="lex-kicker-trk font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          {kicker}
        </span>
        <h2 className="lex-title-main font-headline mt-1 text-[1.625rem] font-bold leading-tight tracking-tight text-[var(--text)] md:text-[1.75rem]">
          {title}
        </h2>
        <p className="lex-desc-main mt-1.5 font-body text-xs leading-relaxed text-[var(--muted)] md:text-[13px]">{desc}</p>
      </div>

      <div className="flex flex-shrink-0 flex-wrap items-center gap-2 md:gap-2.5">
        <button
          type="button"
          onClick={onDemo}
          className="lex-header-pill flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[#c8bfaa] hover:text-[var(--text)] md:px-3.5 md:text-[13px]"
        >
          <span className="material-symbols-outlined text-base">science</span>
          Demo mode
        </button>

        <button
          type="button"
          aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
          onClick={() => {
            void resumeAudioContext();
            onSoundToggle(!soundEnabled);
          }}
          className="lex-header-pill flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition-colors hover:border-[#c8bfaa] hover:text-[var(--text)] md:text-[13px]"
        >
          <span className="text-sm">{soundEnabled ? "🔊" : "🔇"}</span>
          {soundEnabled ? "Sound on" : "Sound off"}
        </button>

        {onSignOut ? (
          <button
            type="button"
            aria-label="Sign out"
            onClick={onSignOut}
            className="lex-header-icon-btn flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:bg-[var(--border-muted)] hover:text-[var(--text)] md:hidden"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        ) : null}
        <span
          className="lex-header-icon-btn hidden h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] opacity-50 sm:flex"
          aria-hidden
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </span>
      </div>
    </header>
  );
}
