"use client";

import type { LexifydGameMode } from "@/lib/types";
import { MODE_SPLASH_THEMES } from "@/lib/modeSplashThemes";
import { playUiClick, resumeAudioContext } from "@/lib/sounds";
import { useEffect, useMemo, useState } from "react";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

type Particle = { id: number; left: string; dx: string; dur: string; del: string; wh: string };

function makeMsParticles(n: number): Particle[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    dx: (Math.random() * 2 - 1).toFixed(2),
    dur: `${5 + Math.random() * 7}s`,
    del: `${Math.random() * 5}s`,
    wh: `${2 + Math.random() * 3}px`,
  }));
}

type Props = {
  open: boolean;
  mode: LexifydGameMode;
  soundEnabled: boolean;
  /** When true, Begin is disabled (e.g. custom with no word). */
  beginDisabled?: boolean;
  onClose: () => void;
  onBegin: () => void;
};

export function ModeSplashOverlay({
  open,
  mode,
  soundEnabled,
  beginDisabled = false,
  onClose,
  onBegin,
}: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const m = MODE_SPLASH_THEMES[mode];

  const particles = useMemo(() => {
    if (!open) return [];
    return makeMsParticles(28);
  }, [open]);

  const playClick = () => {
    void resumeAudioContext();
    if (soundEnabled) playUiClick();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="lex-mode-splash fixed inset-0 z-[9000] flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lex-mode-splash-title"
    >
      <div
        className="absolute inset-0 transition-opacity duration-[400ms]"
        style={{ background: m.bg }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {particles.map((p) => (
          <div
            key={p.id}
            className={`lex-mode-splash-msp absolute rounded-full ${reducedMotion ? "opacity-50" : ""}`}
            style={{
              left: p.left,
              bottom: 0,
              width: p.wh,
              height: p.wh,
              background: m.particleColor,
              ["--dx" as string]: p.dx,
              animationDuration: reducedMotion ? undefined : p.dur,
              animationDelay: reducedMotion ? undefined : p.del,
            }}
          />
        ))}
      </div>
      <div
        className="lex-mode-splash-ring pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ width: 300, height: 300, borderColor: m.ringColor, animationDelay: "0s" }}
        aria-hidden
      />
      <div
        className="lex-mode-splash-ring pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ width: 500, height: 500, borderColor: m.ringColor, animationDelay: "0.7s" }}
        aria-hidden
      />
      <div
        className="lex-mode-splash-ring pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{ width: 700, height: 700, borderColor: m.ringColor, animationDelay: "1.4s" }}
        aria-hidden
      />

      <div
        key={mode}
        className={`relative z-[2] max-w-[520px] px-6 text-center ${reducedMotion ? "" : "lex-mode-splash-pop"}`}
      >
        <div
          className="lex-ms-seal relative mx-auto mb-5 flex h-[100px] w-[100px] items-center justify-center rounded-full text-[44px]"
          style={{
            background: m.sealBg,
            boxShadow: `0 0 40px ${m.sealBorder}, inset 0 0 20px ${m.sealBg}`,
            ["--ms-seal-border" as string]: m.sealBorder,
          }}
        >
          <span aria-hidden>{m.icon}</span>
        </div>
        <p className="mb-2 font-headline text-[9px] uppercase tracking-[0.28em]" style={{ color: m.kickerColor }}>
          {m.kicker}
        </p>
        <h2
          id="lex-mode-splash-title"
          className="font-display text-[clamp(1.75rem,4vw,2.625rem)] font-bold italic leading-tight"
          style={{ color: m.titleColor }}
        >
          <span className="mb-1 block font-tamil text-[0.55em] opacity-50" style={{ color: m.titleColor }}>
            {m.tamilWord}
          </span>
          {m.name}
        </h2>
        <p className="mb-5 font-headline text-[10px] uppercase tracking-[0.2em] opacity-50" style={{ color: m.kickerColor }}>
          {m.subtitle}
        </p>
        <div className="mx-auto mb-4 h-px w-[60px] opacity-20" style={{ background: m.titleColor }} />
        <p className="mb-2 text-[15px] leading-[1.85]" style={{ color: m.textColor }}>
          {m.desc}
        </p>
        <p
          className="mx-auto mb-7 inline-block max-w-full rounded px-4 py-2.5 text-left font-display text-sm italic opacity-50"
          style={{
            color: m.quoteColor,
            borderLeft: `2px solid ${m.quoteBorder}`,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {m.quote}
        </p>
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {m.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border px-3 py-1 font-headline text-[8px] uppercase tracking-[0.15em] opacity-60"
              style={{ borderColor: m.tagColor, color: m.titleColor }}
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          disabled={beginDisabled}
          onClick={() => {
            playClick();
            onBegin();
          }}
          className="mb-2.5 inline-block rounded border-none px-10 py-3.5 font-headline text-[11px] uppercase tracking-[0.2em] text-[#f0ebe0] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          style={{
            background: m.btnBg,
            boxShadow: `0 6px 24px ${m.btnShadow}`,
          }}
        >
          Begin →
        </button>
        <button
          type="button"
          onClick={() => {
            playClick();
            onClose();
          }}
          className="mx-auto block border-none bg-transparent font-body text-xs tracking-wide opacity-40 transition hover:opacity-70"
          style={{ color: m.cancelColor }}
        >
          ← Choose different mode
        </button>
      </div>
    </div>
  );
}
