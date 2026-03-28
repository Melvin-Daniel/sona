"use client";

import { markEntryIntroDoneInSession } from "@/lib/entryIntroStorage";
import { resumeAudioContext, playUiClick } from "@/lib/sounds";
import { useCallback, useEffect, useMemo, useState } from "react";

const HISTORY = [
  {
    era: "c. 300 BCE — The Sangam Age",
    head: "One of Earth's Oldest Living Languages",
    body: (
      <>
        Tamil is among the world&apos;s longest-surviving classical languages — with a literary tradition spanning over{" "}
        <strong className="text-[var(--accent-hover)]">2,300 years</strong>. The{" "}
        <span className="font-tamil text-base font-semibold text-[var(--accent-hover)]">சங்கம்</span> poets wrote of love,
        war, and nature with breathtaking precision — in a language still spoken by 80 million people today.
      </>
    ),
    quote: '"யாதும் ஊரே யாவரும் கேளிர்" — Every town is my town; all people are my kin.',
  },
  {
    era: "c. 100 CE — The Grammar of Eternity",
    head: "Tolkāppiyam: The World's Most Ancient Grammar",
    body: (
      <>
        The <span className="font-tamil text-base font-semibold text-[var(--accent-hover)]">தொல்காப்பியம்</span>{" "}
        classified not just phonology and grammar, but{" "}
        <strong className="text-[var(--accent-hover)]">human emotions and landscapes</strong> — a unique system called Akam
        poetry that encoded the interior world in natural imagery.
      </>
    ),
    quote: '"Words change with context — meaning lives in use, not in isolation."',
  },
  {
    era: "The Secret of Polysemy",
    head: "One Word. Many Worlds.",
    body: (
      <>
        Tamil&apos;s genius lies in <strong className="text-[var(--accent-hover)]">polysemy</strong> — single words
        carrying multiple unrelated meanings. <span className="font-tamil text-base font-semibold text-[var(--accent-hover)]">ஆறு</span>{" "}
        means both <em>river</em> and <em>six</em>. Context is everything — and mastering it is the mark of true fluency.
      </>
    ),
    quote: "This game trains your mind to read context the way ancient Tamil scholars did.",
  },
];

const LOAD_STEPS = [
  { pct: 18, lbl: "Summoning ancient lexicons…", delay: 400 },
  { pct: 38, lbl: "Parsing Sangam verse…", delay: 700 },
  { pct: 55, lbl: "Mapping polysemic pathways…", delay: 600 },
  { pct: 72, lbl: "Loading Tamil WordNet…", delay: 800 },
  { pct: 88, lbl: "Calibrating context engine…", delay: 600 },
  { pct: 100, lbl: "Ready.", delay: 400 },
];

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

type Particle = { id: number; left: string; dx: string; dur: string; del: string; size: string };

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    dx: (Math.random() * 2 - 1).toFixed(2),
    dur: `${4 + Math.random() * 6}s`,
    del: `${Math.random() * 8}s`,
    size: `${1 + Math.random() * 2}px`,
  }));
}

type Props = {
  onEnter: () => void;
};

export function LexEntryIntro({ onEnter }: Props) {
  const reducedMotion = usePrefersReducedMotion();
  const [soundPref, setSoundPref] = useState(true);
  useEffect(() => {
    try {
      setSoundPref(localStorage.getItem("lexifyd_sound") !== "0");
    } catch {
      setSoundPref(true);
    }
  }, []);
  const particles = useMemo(() => makeParticles(40), []);
  const [histIdx, setHistIdx] = useState(0);
  const [loadPct, setLoadPct] = useState(0);
  const [loadLbl, setLoadLbl] = useState("Summoning ancient lexicons…");
  const [showEnter, setShowEnter] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setLoadPct(100);
      setLoadLbl("Ready.");
      setShowEnter(true);
      return;
    }
    const t = window.setTimeout(() => {
      let i = 0;
      const step = () => {
        if (i >= LOAD_STEPS.length) {
          setShowEnter(true);
          return;
        }
        const s = LOAD_STEPS[i];
        i += 1;
        window.setTimeout(() => {
          setLoadPct(s.pct);
          setLoadLbl(s.lbl);
          step();
        }, s.delay);
      };
      step();
    }, 2200);
    return () => window.clearTimeout(t);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      setHistIdx((n) => (n + 1) % HISTORY.length);
    }, 3800);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const handleEnter = useCallback(() => {
    void resumeAudioContext();
    if (soundPref) playUiClick();
    markEntryIntroDoneInSession();
    onEnter();
  }, [onEnter, soundPref]);

  return (
    <div
      className="lex-entry-intro fixed inset-0 z-[999] flex flex-col items-center justify-center overflow-hidden bg-[#f0ebe0] text-[#1a1a14]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lex-entry-title"
    >
      <div className="lex-entry-intro-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {particles.map((p) => (
          <div
            key={p.id}
            className={`lex-entry-lp absolute rounded-full bg-[var(--accent)] ${reducedMotion ? "opacity-40" : ""}`}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              ["--dx" as string]: p.dx,
              animationDuration: reducedMotion ? undefined : p.dur,
              animationDelay: reducedMotion ? undefined : p.del,
            }}
          />
        ))}
      </div>
      <div
        className={`pointer-events-none absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent ${reducedMotion ? "scale-x-100" : "lex-entry-lineload"}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-tamil text-[clamp(8rem,22vw,18rem)] font-bold leading-none text-[color-mix(in_srgb,var(--accent)_5%,transparent)] ${reducedMotion ? "" : "lex-entry-bgpan"}`}
        aria-hidden
      >
        தமிழ் மொழி
      </div>

      <div className="relative z-[2] flex flex-col items-center px-4">
        <div className={`relative mb-9 ${reducedMotion ? "" : "lex-entry-logoin"}`}>
          <div className="lex-entry-logo-glow pointer-events-none absolute inset-[-40px] rounded-full" aria-hidden />
          <div className="lex-entry-logo-seal relative flex h-[110px] w-[110px] items-center justify-center rounded-full border-2 border-[var(--accent)] bg-[radial-gradient(circle,#faf7f2_0%,#e8e2d0_100%)] shadow-[0_0_40px_rgba(31,74,58,0.2)]">
            <div className="pointer-events-none absolute inset-[6px] rounded-full border border-[color-mix(in_srgb,var(--accent)_20%,transparent)]" />
            <span className="font-tamil text-[50px] font-bold leading-none text-[var(--accent)] [text-shadow:0_0_20px_rgba(31,74,58,0.3)]">
              லெ
            </span>
          </div>
        </div>
        <div className="mb-1.5 text-center">
          <h1
            id="lex-entry-title"
            className={`font-headline text-[clamp(2rem,6vw,3rem)] font-bold uppercase tracking-[0.5em] text-[var(--accent)] [text-shadow:0_0_40px_rgba(31,74,58,0.2)] ${reducedMotion ? "" : "lex-entry-titlein"}`}
          >
            Lexifyd
          </h1>
          <p className={`mt-1 font-display text-sm italic tracking-[0.2em] text-[var(--muted)] ${reducedMotion ? "" : "lex-entry-fadein-delayed"}`}>
            The Ancient Language Awaits
          </p>
        </div>
      </div>

      <div className={`relative z-[2] mt-10 w-full max-w-[620px] px-2 ${reducedMotion ? "" : "lex-entry-fadein-bar"}`}>
        {HISTORY.map((h, i) => (
          <div
            key={h.era}
            className={`lex-entry-hist-card relative overflow-hidden rounded border border-[#c8bfaa] bg-[rgba(250,247,242,0.97)] px-6 py-5 shadow-[0_4px_24px_rgba(31,74,58,0.08)] ${
              i === histIdx ? "block" : "hidden"
            }`}
          >
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b from-transparent via-[var(--accent)] to-transparent" />
            <p className="mb-1 font-headline text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">{h.era}</p>
            <p className="mb-2 font-display text-lg font-semibold italic text-[#1a1a14]">{h.head}</p>
            <p className="text-[12.5px] leading-[1.8] text-[var(--muted)]">{h.body}</p>
            <p className="mt-2 border-l-2 border-[#c8bfaa] pl-3 font-display text-[13px] italic leading-relaxed text-[color-mix(in_srgb,var(--accent)_60%,var(--muted))]">
              {h.quote}
            </p>
          </div>
        ))}
        <div className="mt-3 flex gap-1.5">
          {HISTORY.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setHistIdx(i);
                if (soundPref) playUiClick();
                void resumeAudioContext();
              }}
              className={`h-1.5 rounded-full transition-all ${i === histIdx ? "w-[18px] rounded-sm bg-[var(--gold)]" : "w-1.5 bg-[#c8bfaa]"}`}
              aria-label={`History slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className={`relative z-[2] mt-5 w-full max-w-[620px] px-2 ${reducedMotion ? "" : "lex-entry-fadein-bar2"}`}>
        <div className="h-0.5 overflow-hidden rounded-sm bg-[var(--border)]">
          <div
            className="h-full bg-gradient-to-r from-[#2a6a50] via-[var(--accent)] to-[var(--gold)] transition-[width] duration-[400ms] ease-out [box-shadow:0_0_8px_rgba(31,74,58,0.3)]"
            style={{ width: `${loadPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between font-headline text-[9px] uppercase tracking-wide text-[var(--muted)]">
          <span>{loadLbl}</span>
          <span>{loadPct}%</span>
        </div>
        <button
          type="button"
          onClick={handleEnter}
          className={`mt-4 w-full rounded-sm border border-[var(--accent)] bg-[var(--accent)] py-3 font-headline text-[11px] uppercase tracking-[0.2em] text-[#f0ebe0] transition hover:bg-[#2a6a50] hover:shadow-[0_4px_20px_rgba(31,74,58,0.25)] ${
            showEnter ? "block" : "hidden"
          }`}
        >
          Enter the Lexicon
        </button>
      </div>
    </div>
  );
}
