"use client";

import type { SessionRoundHow, SessionRoundLog } from "@/lib/sessionHistory";
import { meaningChipDisplayLabel, meaningChipHeadAndGloss } from "@/lib/senseDisplay";
import type { ChallengeRound, SenseSlot } from "@/lib/types";
import { tamilToTanglish, tanglishSuffix } from "@/lib/tanglish";
import {
  playCombo,
  playCorrect,
  playDanger,
  playHint,
  playRunComplete,
  playTick,
  playTimeUp,
  playWrong,
} from "@/lib/sounds";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  senses: SenseSlot[];
  rounds: ChallengeRound[];
  accessibilityMCQ: boolean;
  onAccessibilityChange?: (v: boolean) => void;
  onSessionEnd: (summary: {
    total: number;
    correct: number;
    bySense: Record<string, boolean>;
    rounds: SessionRoundLog[];
  }) => void;
  onRoundComplete?: (p: {
    senseId: string;
    correct: boolean;
    elapsedSec: number;
    usedDrag: boolean;
  }) => void;
  onActiveSenseChange?: (senseId: string) => void;
  onRoundMeta?: (m: { idx: number; total: number }) => void;
  oliBalance: number;
  onSpendOli: (n: number) => boolean;
  onOliEarn?: () => void;
  /**
   * When set and hints are enabled, remove-wrong and keyword hints share this budget per round
   * without spending global progression oli. Boss mode uses `hintsDisabled` instead.
   */
  hintUsesPerRound?: number;
  arcadePressureSec: number | null;
  /** Shown above the timer bar (e.g. Arcade vs Boss) */
  pressureLabel?: string;
  /** Boss-style run: no ஒளி hints */
  hintsDisabled?: boolean;
  /** When set, time-up overlay copy matches Arcade vs Boss */
  timedPressureMode?: "arcade" | "boss" | null;
  soundEnabled: boolean;
  reducedMotion: boolean;
  /** Friend mockup: two-column deck + centered result modal */
  layoutVariant?: "default" | "parchment";
  parchmentHud?: {
    modeLabel: string;
    word: string;
    score: number;
    combo: number;
    showRun: boolean;
  };
};

function norm(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function firstTamilToken(s: string): { before: string; word: string; after: string } | null {
  const m = s.match(/([\u0B80-\u0BFF]+)/);
  if (!m || m.index === undefined || !m[1]) return null;
  const i = m.index;
  const word = m[1];
  return { before: s.slice(0, i), word, after: s.slice(i + word.length) };
}

export function DragDropGame({
  senses,
  rounds,
  accessibilityMCQ,
  onAccessibilityChange,
  onSessionEnd,
  onRoundComplete,
  onActiveSenseChange,
  onRoundMeta,
  oliBalance,
  onSpendOli,
  onOliEarn,
  arcadePressureSec,
  pressureLabel = "Time pressure",
  hintsDisabled = false,
  hintUsesPerRound,
  timedPressureMode = null,
  soundEnabled,
  reducedMotion,
  layoutVariant = "default",
  parchmentHud,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const resultsRef = useRef(results);
  resultsRef.current = results;

  const [slotShake, setSlotShake] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [wrongBurst, setWrongBurst] = useState(false);
  const [meaningHint, setMeaningHint] = useState<string | null>(null);
  const roundStartRef = useRef(Date.now());
  const [eliminated, setEliminated] = useState<number[]>([]);
  const [keywordHint, setKeywordHint] = useState(false);
  const [timerLeft, setTimerLeft] = useState<number | null>(null);
  const [showTimeUp, setShowTimeUp] = useState(false);
  const timeUpHandledRef = useRef(false);
  const timeUpTimeoutRef = useRef<ReturnType<typeof globalThis.setTimeout> | null>(null);
  const finishRoundRef = useRef<(c: boolean, d: boolean, mcq: number | null) => void>(() => {});
  const roundLogRef = useRef<SessionRoundLog[]>([]);
  const [roundRevealAnnounce, setRoundRevealAnnounce] = useState("");
  const [roundHintUsesLeft, setRoundHintUsesLeft] = useState(0);
  const [screenFlash, setScreenFlash] = useState<null | "green" | "red">(null);

  const perRoundHintPool =
    !hintsDisabled && hintUsesPerRound != null && hintUsesPerRound > 0;
  const hintsRemaining = perRoundHintPool ? roundHintUsesLeft : oliBalance;

  const senseById = useMemo(
    () => Object.fromEntries(senses.map((s) => [s.id, s])),
    [senses]
  );

  const current = rounds[idx];
  const total = rounds.length;

  useEffect(() => {
    roundStartRef.current = Date.now();
    setMeaningHint(null);
    setEliminated([]);
    setKeywordHint(false);
    setPicked(null);
    if (perRoundHintPool && hintUsesPerRound != null) {
      setRoundHintUsesLeft(hintUsesPerRound);
    }
    onActiveSenseChange?.(current?.senseId ?? "");
    onRoundMeta?.({ idx, total });
  }, [idx, current?.senseId, hintUsesPerRound, onActiveSenseChange, onRoundMeta, perRoundHintPool, total]);

  useEffect(() => {
    setScreenFlash(null);
  }, [idx]);

  useEffect(() => {
    if (!revealed || !current) {
      setRoundRevealAnnounce("");
      return;
    }
    const ok = results[current.senseId];
    setRoundRevealAnnounce(
      ok
        ? "Correct. Answer confirmed. சரி."
        : "Incorrect. Review the explanation in the dialog. தவறு."
    );
  }, [revealed, current, results, idx]);

  const goNext = useCallback(() => {
    if (idx < total - 1) {
      setIdx((i) => i + 1);
      setPicked(null);
      setRevealed(false);
    } else {
      const r = resultsRef.current;
      const correct = Object.values(r).filter(Boolean).length;
      if (soundEnabled) playRunComplete(soundEnabled);
      onSessionEnd({
        total,
        correct,
        bySense: r,
        rounds: [...roundLogRef.current],
      });
    }
  }, [idx, onSessionEnd, soundEnabled, total]);

  const finishRound = useCallback(
    (correct: boolean, usedDrag: boolean, mcqPickIndex: number | null) => {
      if (!current || revealed) return;
      const elapsed = (Date.now() - roundStartRef.current) / 1000;
      const sense = senseById[current.senseId];
      const how: SessionRoundHow =
        correct && usedDrag ? "drag" : mcqPickIndex !== null ? "mcq" : "timeout";
      const log: SessionRoundLog = {
        senseId: current.senseId,
        senseLabel: sense ? `${sense.glossEn} (${sense.pos})` : current.senseId,
        sentence: current.sentence,
        correct,
        how,
        correctIndex: current.correctIndex,
        correctText: current.options[current.correctIndex] ?? "",
      };
      if (mcqPickIndex !== null) {
        const pi = mcqPickIndex;
        log.pickedIndex = pi;
        log.pickedText = current.options[pi];
        const role = current.optionRoles?.[pi];
        if (role) log.pickedRole = role;
        if (pi !== current.correctIndex) {
          log.explainWrongTa = current.explainWrongTa?.[pi];
          log.explainWrongEn = current.explainWrongEn?.[pi];
        }
      }
      roundLogRef.current.push(log);
      if (!reducedMotion) {
        setScreenFlash(correct ? "green" : "red");
        window.setTimeout(() => setScreenFlash(null), 560);
      }
      setRevealed(true);
      setResults((prev) => ({ ...prev, [current.senseId]: correct }));
      onRoundComplete?.({
        senseId: current.senseId,
        correct,
        elapsedSec: elapsed,
        usedDrag,
      });
      if (correct) {
        onOliEarn?.();
        if (soundEnabled) {
          let streak = 1;
          for (let j = idx - 1; j >= 0; j--) {
            const sid = rounds[j]?.senseId;
            if (sid && resultsRef.current[sid]) streak++;
            else break;
          }
          if (streak >= 3) playCombo(soundEnabled);
          else playCorrect();
        }
        if (!reducedMotion) {
          setConfetti(true);
          window.setTimeout(() => setConfetti(false), 2200);
        }
      } else if (soundEnabled && how !== "timeout") {
        playWrong();
      }
      if (!correct && how !== "timeout" && !reducedMotion) {
        setWrongBurst(true);
        window.setTimeout(() => setWrongBurst(false), 1400);
      }
    },
    [current, idx, onRoundComplete, onOliEarn, revealed, reducedMotion, rounds, senseById, soundEnabled],
  );

  finishRoundRef.current = finishRound;

  useEffect(() => {
    timeUpHandledRef.current = false;
    setShowTimeUp(false);
    if (arcadePressureSec == null || revealed) {
      setTimerLeft(null);
      return;
    }
    let left = arcadePressureSec;
    setTimerLeft(left);
    const id = window.setInterval(() => {
      left -= 1;
      setTimerLeft(left);
      if (left > 0) {
        if ([15, 10, 5].includes(left)) playDanger(soundEnabled);
        if (left <= 10) playTick(soundEnabled);
      }
      if (left <= 0) {
        window.clearInterval(id);
        if (timeUpHandledRef.current) return;
        timeUpHandledRef.current = true;
        setShowTimeUp(true);
        if (soundEnabled) playTimeUp();
        const delay = reducedMotion ? 320 : 1050;
        timeUpTimeoutRef.current = globalThis.setTimeout(() => {
          timeUpTimeoutRef.current = null;
          finishRoundRef.current(false, false, null);
          setShowTimeUp(false);
        }, delay);
      }
    }, 1000);
    return () => {
      window.clearInterval(id);
      if (timeUpTimeoutRef.current != null) {
        globalThis.clearTimeout(timeUpTimeoutRef.current);
        timeUpTimeoutRef.current = null;
      }
      setShowTimeUp(false);
    };
  }, [idx, arcadePressureSec, current?.senseId, revealed, reducedMotion, soundEnabled]);

  const submitMcq = useCallback(
    (optionIndex: number) => {
      if (!current || revealed) return;
      if (eliminated.includes(optionIndex) && optionIndex !== current.correctIndex) return;
      const ok = optionIndex === current.correctIndex;
      setPicked(optionIndex);
      finishRound(ok, false, optionIndex);
    },
    [current, eliminated, finishRound, revealed]
  );

  const tryMeaningDrop = useCallback(
    (meaningLabel: string) => {
      if (!current || revealed || accessibilityMCQ) return;
      const target = senseById[current.senseId];
      if (!target) return;
      const ok = norm(meaningLabel) === norm(target.meaningTa);
      if (ok) {
        setMeaningHint("சரியான பொருள்.");
        finishRound(true, true, null);
      } else {
        setSlotShake((n) => n + 1);
        if (soundEnabled) playWrong();
        setMeaningHint("மீண்டும் முயற்சி — அல்லது அணுகல்தன்மை MCQ ஐ இயக்கவும்.");
      }
    },
    [accessibilityMCQ, current, finishRound, revealed, senseById, soundEnabled]
  );

  const hintEliminate = useCallback(() => {
    if (!current || revealed || hintsDisabled) return;
    const wrongs = current.options
      .map((_, i) => i)
      .filter((i) => i !== current.correctIndex && !eliminated.includes(i));
    if (!wrongs.length) return;
    if (perRoundHintPool) {
      if (roundHintUsesLeft < 1) return;
      setRoundHintUsesLeft((n) => n - 1);
    } else {
      if (oliBalance < 1) return;
      if (!onSpendOli(1)) return;
    }
    const pick = wrongs[Math.floor(Math.random() * wrongs.length)]!;
    setEliminated((e) => [...e, pick]);
    if (soundEnabled) playHint(soundEnabled);
  }, [
    current,
    eliminated,
    hintsDisabled,
    oliBalance,
    onSpendOli,
    perRoundHintPool,
    revealed,
    roundHintUsesLeft,
    soundEnabled,
  ]);

  const hintKeyword = useCallback(() => {
    if (!current || revealed || keywordHint || hintsDisabled) return;
    if (perRoundHintPool) {
      if (roundHintUsesLeft < 1) return;
      setRoundHintUsesLeft((n) => n - 1);
    } else {
      if (oliBalance < 1) return;
      if (!onSpendOli(1)) return;
    }
    setKeywordHint(true);
    if (soundEnabled) playHint(soundEnabled);
  }, [
    current,
    hintsDisabled,
    keywordHint,
    oliBalance,
    onSpendOli,
    perRoundHintPool,
    revealed,
    roundHintUsesLeft,
    soundEnabled,
  ]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!current || revealed) {
        if (revealed && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          goNext();
        }
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= 4) {
        const i = n - 1;
        if (!eliminated.includes(i) || i === current.correctIndex) {
          submitMcq(i);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, revealed, submitMcq, goNext, eliminated]);

  if (!current || total === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">No rounds loaded. Generate a word first.</p>
    );
  }

  const morph = senseById[current.senseId]?.morphForms;
  const morphDisplay =
    morph && morph.length > 0 ? (
      <>
        {morph.map((seg, mi) => (
          <span key={`${seg}-${mi}`}>
            {mi > 0 ? " · " : null}
            {seg}
            <span className="font-body text-sm font-normal text-[var(--muted-2)]">{tanglishSuffix(seg)}</span>
          </span>
        ))}
      </>
    ) : null;
  const tok = keywordHint ? firstTamilToken(current.sentence) : null;
  const isParchment = layoutVariant === "parchment" && parchmentHud != null;
  const ph = parchmentHud;

  const formatMmSs = (sec: number | null) => {
    if (sec == null) return "—";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const resultsOk = results[current.senseId] === true;
  const bannerExplain = (
    <>
      {picked !== null &&
        picked !== current.correctIndex &&
        (current.explainWrongTa?.[picked] || current.explainWrongEn?.[picked]) && (
          <p className="mb-1">
            <span className="font-tamil font-semibold text-[var(--accent)]">
              {current.explainWrongTa?.[picked]}
            </span>
            {current.explainWrongEn?.[picked] ? (
              <span className="mt-1 block text-[var(--muted)]">{current.explainWrongEn[picked]}</span>
            ) : null}
          </p>
        )}
      <p>
        Correct:{" "}
        <span className="font-tamil font-semibold text-[var(--text)]">
          {current.options[current.correctIndex]}
          <span className="font-body font-normal text-[var(--muted-2)]">
            {tanglishSuffix(current.options[current.correctIndex] ?? "")}
          </span>
        </span>{" "}
        · {senseById[current.senseId]?.glossEn}
      </p>
      {resultsOk ? (
        <p className="mt-1">
          <strong className="text-[var(--text)]">+12 XP</strong> toward your level.
        </p>
      ) : null}
    </>
  );

  const sentenceRom = tamilToTanglish(current.sentence);
  const sentenceBlock = (
    <p className="lex-sentence mt-2">
      {tok ? (
        <>
          <span className="text-[var(--muted)]">{tok.before}</span>
          <span className="font-semibold text-[var(--accent)] underline decoration-[color-mix(in_srgb,var(--accent)_55%,transparent)]">
            {tok.word}
          </span>
          <span className="text-[var(--muted)]">{tok.after}</span>
        </>
      ) : (
        current.sentence
      )}
      {sentenceRom ? (
        <span className="block font-body text-ui-sm text-[var(--muted-2)]">({sentenceRom})</span>
      ) : null}
    </p>
  );

  const dropSlot = (
    <div
      key={slotShake}
      className={`meaning-slot mt-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--accent-ink)]/80 p-4 transition-transform ${
        slotShake && !reducedMotion ? "animate-slot-shake" : ""
      } ${isParchment ? "min-h-[52px] text-center" : ""}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const m = e.dataTransfer.getData("text/meaning");
        if (m) tryMeaningDrop(m);
      }}
    >
      <p className="text-ui text-[var(--muted-2)]">
        {accessibilityMCQ
          ? "Drag optional in accessibility mode — use cards below."
          : "Drag the correct meaning chip here (primary)."}
      </p>
      {meaningHint && <p className="mt-2 text-ui text-[var(--muted)]">{meaningHint}</p>}
    </div>
  );

  const chipsBlock = (
    <div className="flex flex-wrap gap-2">
      {senses.map((s) => {
        const { head, gloss } = meaningChipHeadAndGloss(s);
        const headTl = tanglishSuffix(head);
        return (
          <button
            key={s.id}
            type="button"
            aria-label={meaningChipDisplayLabel(s)}
            draggable={!accessibilityMCQ}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/meaning", s.meaningTa);
            }}
            onClick={() => {
              if (!accessibilityMCQ) tryMeaningDrop(s.meaningTa);
            }}
            className={`lex-chip text-[var(--text)] ${revealed && s.id === current.senseId ? "lex-chip-correct" : ""}`}
          >
            <span className="font-tamil">{head}</span>
            {headTl ? (
              <span className="ml-1 font-body text-sm text-[var(--muted-2)]">{headTl}</span>
            ) : null}
            {gloss ? (
              <span className="ml-1.5 font-body text-sm font-semibold text-[var(--muted-2)]">({gloss})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );

  const mcqBlock = (cols: "1" | "2") => (
    <div className={cols === "2" ? "grid gap-2 sm:grid-cols-2" : "lex-mcq-parch"}>
      {current.options.map((opt, i) => {
        const hidden = eliminated.includes(i) && i !== current.correctIndex && !revealed;
        const baseIdle =
          "border-[var(--border)] bg-[color-mix(in_srgb,var(--card-elevated)_75%,transparent)] hover:border-[color-mix(in_srgb,var(--accent)_40%,var(--border))]";
        const baseRevealedNeutral =
          "border-[var(--border)] bg-[color-mix(in_srgb,var(--card-elevated)_70%,transparent)] opacity-90";
        return (
          <button
            key={`${opt}-${i}`}
            type="button"
            disabled={revealed || hidden}
            onClick={() => submitMcq(i)}
            className={`lex-option text-left ${hidden ? "opacity-25" : ""} ${
              revealed ? baseRevealedNeutral : baseIdle
            }`}
          >
            <span className="block">
              <span className="lex-mcq-num mr-2 inline-flex h-6 min-w-[1.25rem] items-center justify-center rounded border border-[var(--border)] bg-[var(--card)] text-ui-sm font-semibold text-[var(--muted-2)]">
                {i + 1}
              </span>
              <span className="font-tamil">{opt}</span>
              <span className="font-body text-ui-sm text-[var(--muted-2)]">{tanglishSuffix(opt)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={`relative ${isParchment ? "flex min-h-0 flex-1 flex-col" : "space-y-6"}`}>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {roundRevealAnnounce}
      </div>
      {screenFlash ? (
        <div
          className={
            screenFlash === "green" ? "lex-game-flash lex-game-flash--green" : "lex-game-flash lex-game-flash--red"
          }
          aria-hidden
        />
      ) : null}
      {showTimeUp && (
        <div
          className="fixed inset-0 z-[45] flex items-center justify-center bg-black/45 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="lex-time-up-title"
        >
          <div className="lex-card max-w-sm border-2 border-[color-mix(in_srgb,var(--danger)_48%,var(--border))] bg-[var(--card)] p-6 text-center shadow-2xl">
            <p
              id="lex-time-up-title"
              className="font-display text-xl font-bold text-[var(--text)] md:text-2xl"
            >
              Time&apos;s up
            </p>
            <p className="mt-2 text-ui text-[var(--muted)]">
              {timedPressureMode === "boss"
                ? "Boss clock — round closes. Review the answer in the dialog."
                : timedPressureMode === "arcade"
                  ? "Arcade clock — you get more time back on the next word if you need it."
                  : "The round timer hit zero. Review the answer in the dialog."}
            </p>
          </div>
        </div>
      )}

      {confetti && !reducedMotion && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="confetti-particle"
              style={{
                left: `${(i * 37) % 100}%`,
                animationDelay: `${i * 40}ms`,
                background:
                  i % 3 === 0
                    ? "var(--confetti-a)"
                    : i % 3 === 1
                      ? "var(--confetti-b)"
                      : "var(--confetti-c)",
              }}
            />
          ))}
        </div>
      )}

      {wrongBurst && !reducedMotion && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="wrong-burst-particle"
              style={{
                left: `${15 + (i * 53) % 70}%`,
                animationDelay: `${i * 45}ms`,
                background: i % 2 === 0 ? "var(--danger)" : "color-mix(in srgb, var(--danger) 65%, var(--gold))",
              }}
            />
          ))}
        </div>
      )}

      {timerLeft != null && arcadePressureSec != null && !revealed && (
        <div className={`space-y-1 ${isParchment ? "shrink-0" : ""}`}>
          <div className="flex justify-between text-ui text-[var(--muted)]">
            <span>{pressureLabel}</span>
            <span className="tabular-nums text-[var(--accent)]">{timerLeft}s</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--accent-ink)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{
                width: `${Math.max(0, (timerLeft / arcadePressureSec) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {isParchment && ph ? (
        <div className="lex-game-area-parch min-h-0 flex-1 overflow-y-auto px-0 pt-1">
          <div className="w-full max-w-none">
            <div className="lex-parch-hud">
              <span className="lex-parch-hud-badge">{ph.modeLabel}</span>
              <span className="lex-parch-hud-word">
                <span className="font-tamil">{ph.word || "—"}</span>
                {ph.word ? (
                  <span className="font-body text-[var(--muted-2)]">{tanglishSuffix(ph.word)}</span>
                ) : null}
              </span>
              <span className="lex-parch-hud-div" aria-hidden />
              <div className="lex-parch-hud-stat">
                <div className="lex-parch-hud-sv">{ph.showRun ? ph.score : "—"}</div>
                <div className="lex-parch-hud-sl">Score</div>
              </div>
              <span className="lex-parch-hud-div" aria-hidden />
              <div className="lex-parch-hud-stat">
                <div className="lex-parch-hud-sv">×{ph.showRun ? ph.combo || 1 : 1}</div>
                <div className="lex-parch-hud-sl">Combo</div>
              </div>
              <span className="lex-parch-hud-div" aria-hidden />
              <div className="lex-parch-hud-stat">
                <div
                  className="lex-parch-hud-sv tabular-nums"
                  style={{
                    color:
                      timerLeft != null && timerLeft <= 15
                        ? "var(--danger)"
                        : timerLeft != null && timerLeft <= 30
                          ? "var(--gold)"
                          : undefined,
                  }}
                >
                  {formatMmSs(timerLeft)}
                </div>
                <div className="lex-parch-hud-sl">Time</div>
              </div>
              <span className="lex-parch-hud-div hidden lg:block" aria-hidden />
              <div className="lex-parch-hud-prog w-full lg:min-w-0 lg:flex-1">
                <div className="lex-parch-hud-pl">
                  Round {idx + 1} / {total}
                </div>
                <div className="lex-parch-hud-dots" aria-hidden>
                  {Array.from({ length: total }).map((_, i) => (
                    <div
                      key={i}
                      className={`lex-parch-hud-dot ${i < idx ? "done" : i === idx ? "cur" : ""}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="lex-game-cols">
              <div className="flex min-w-0 flex-col gap-3">
                {morph && morph.length > 0 && (
                  <div className="lex-g-card">
                    <div className="lex-g-card-title">Surface forms</div>
                    <p className="font-tamil text-base font-medium leading-relaxed text-[var(--text)] lg:text-lg">
                      {morphDisplay}
                    </p>
                  </div>
                )}
                <div
                  className="lex-g-card"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const m = e.dataTransfer.getData("text/meaning");
                    if (m) tryMeaningDrop(m);
                  }}
                >
                  <div className="lex-g-card-title">Context sentence</div>
                  {sentenceBlock}
                  {dropSlot}
                  <div className="mt-3">
                    <div className="lex-g-card-title">Meaning chips</div>
                    <div className="mt-2">{chipsBlock}</div>
                  </div>
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-ui text-[var(--muted)]">
                    <input
                      type="checkbox"
                      checked={accessibilityMCQ}
                      onChange={(e) => onAccessibilityChange?.(e.target.checked)}
                      className="rounded border-[var(--border)]"
                    />
                    Accessibility: choice cards (MCQ)
                  </label>
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <div className="lex-g-card">
                  <div className="lex-g-card-title">Fragment challenge</div>
                  {mcqBlock("1")}
                </div>
                <div className="lex-g-card">
                  <div className="lex-g-card-title flex flex-wrap items-center gap-2">
                    Hints
                    <span className="ml-auto rounded border border-[var(--accent-light)] bg-[color-mix(in_srgb,var(--accent)_8%,var(--card))] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                      {hintsRemaining} left
                    </span>
                  </div>
                  <div className="lex-hint-row mt-2">
                    <button
                      type="button"
                      disabled={revealed || hintsDisabled || hintsRemaining < 1}
                      onClick={hintEliminate}
                      className="lex-hint-btn"
                    >
                      ⊘ Remove wrong
                      <span className="lex-hint-cost">−1</span>
                    </button>
                    <button
                      type="button"
                      disabled={revealed || hintsDisabled || hintsRemaining < 1 || keywordHint}
                      onClick={hintKeyword}
                      className="lex-hint-btn"
                    >
                      ◉ Highlight key
                      <span className="lex-hint-cost">−1</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-ui font-medium text-[var(--muted)]">
              Round {idx + 1} / {total}
            </p>
            <label className="flex min-h-[48px] cursor-pointer items-center gap-2.5 text-ui text-[var(--muted)]">
              <input
                type="checkbox"
                checked={accessibilityMCQ}
                onChange={(e) => onAccessibilityChange?.(e.target.checked)}
                className="rounded border-[var(--border)]"
              />
              Accessibility: choice cards (MCQ)
            </label>
          </div>

          {morph && morph.length > 0 && (
            <div className="lex-card px-4 py-3">
              <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">Surface forms</p>
              <p className="mt-1.5 font-tamil text-base text-[var(--text)] lg:text-lg">{morphDisplay}</p>
            </div>
          )}

          <div
            className="lex-card border-[color-mix(in_srgb,var(--accent)_28%,var(--border))] bg-[color-mix(in_srgb,var(--card)_88%,transparent)] p-5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const m = e.dataTransfer.getData("text/meaning");
              if (m) tryMeaningDrop(m);
            }}
          >
            <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--accent)]">Context sentence</p>
            {sentenceBlock}
            {dropSlot}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={revealed || hintsDisabled || hintsRemaining < 1}
              onClick={hintEliminate}
              className="lex-btn-segment border-[color-mix(in_srgb,var(--accent)_45%,var(--border))] font-semibold text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] disabled:opacity-40"
            >
              ஒளி: remove one wrong
              {!hintsDisabled ? ` (${hintsRemaining})` : ""}
            </button>
            <button
              type="button"
              disabled={revealed || hintsDisabled || hintsRemaining < 1 || keywordHint}
              onClick={hintKeyword}
              className="lex-btn-segment disabled:opacity-40"
            >
              ஒளி: highlight keyword
            </button>
          </div>

          <div>
            <p className="mb-3 text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Meaning chips</p>
            {chipsBlock}
          </div>

          <div>
            <p className="mb-3 text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">
              {accessibilityMCQ
                ? "Choose the correct fragment (accessibility)"
                : "Fragment challenge (accessibility / backup) — keys 1–4"}
            </p>
            {mcqBlock("2")}
          </div>

        </>
      )}

      {revealed && (
        <div
          className="fixed inset-0 z-[46] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lex-result-modal-title"
        >
          <div
            className={`lex-result-modal-card w-full max-w-md overflow-y-auto rounded-2xl border-2 bg-[var(--card)] p-6 shadow-2xl ${
              resultsOk ? "lex-result-modal--ok" : "lex-result-modal--bad"
            } ${resultsOk || reducedMotion ? "lex-result-modal-enter" : "lex-result-modal-shake"}`}
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="lex-result-b-icon shrink-0">{resultsOk ? "✓" : "✗"}</div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p id="lex-result-modal-title" className="lex-result-b-title">
                  {resultsOk ? "Excellent!" : "Incorrect"}
                </p>
                <div className="lex-result-b-explain mt-2">{bannerExplain}</div>
                <button type="button" className="lex-result-modal-btn mt-5 w-full sm:w-auto" onClick={goNext}>
                  {idx < total - 1
                    ? isParchment
                      ? "Continue →"
                      : "Next round"
                    : isParchment
                      ? "See Results"
                      : "Finish & summary"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
