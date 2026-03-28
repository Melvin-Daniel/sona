"use client";

import { AchievementToast } from "@/components/AchievementToast";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { AppTabs, type AppTabId } from "@/components/AppTabs";
import {
  ModeSplashOverlay,
  SerenHomeDashboard,
  SerenMobileNav,
  SerenPlayHeader,
  SerenPlayerStrip,
  SerenSidebar,
  type PlayStage,
} from "@/components/seren";
import { ChallengeSkeleton } from "@/components/ChallengeSkeleton";
import { DragDropGame } from "@/components/DragDropGame";
import { GameShell, type RunHud } from "@/components/GameShell";
import { ReviewQueue } from "@/components/ReviewQueue";
import { RunRecap, buildRunRecap, type RunRecapData } from "@/components/RunRecap";
import { SemanticViz } from "@/components/SemanticViz";
import { StickyPlayHud } from "@/components/StickyPlayHud";
import { SummaryDashboard } from "@/components/SummaryDashboard";
import { ACHIEVEMENTS, evaluateAchievements, type AchievementId } from "@/lib/achievements";
import {
  loadLeaderboard,
  loadMastery,
  pushLeaderboardScore,
  recordWordResult,
  weakestWords,
} from "@/lib/mastery";
import {
  addXp,
  earnOli,
  getDailyQuestSnapshot,
  loadProgression,
  recordDailyQuestComplete,
  saveProgression,
  spendOli,
} from "@/lib/progression";
import { recentActivityFromHistory } from "@/lib/dashboardActivity";
import { computeHistoryInsights, mergeReviewQueueWords } from "@/lib/insights";
import { playLevelUp, resumeAudioContext } from "@/lib/sounds";
import { computeRoundPoints } from "@/lib/scoring";
import {
  applyAdaptivePressureSec,
  arcadePressureSeconds,
  BOSS_TIMER_SEC,
  nextPressureDelta,
} from "@/lib/runModes";
import {
  getBossSeedQueue,
  getDailyQuestWords,
  getShuffledSeedQueue,
  HINT_USES_PER_ROUND,
} from "@/lib/seed";
import { tamilToTanglish } from "@/lib/tanglish";
import { listCustomPlayWords } from "@/lib/wordnet/pipeline";
import type {
  DetailedSessionRecord,
  SessionHistoryEntry,
  SessionRoundLog,
} from "@/lib/sessionHistory";
import {
  newSessionId,
  parseHistoryRaw,
  SESSION_STORAGE_KEY,
} from "@/lib/sessionHistory";
import type { LexifydGameMode, PipelineResult } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SOUND_KEY = "lexifyd_sound";

const initialHud: RunHud = {
  score: 0,
  streak: 0,
  bestStreak: 0,
  combo: 1,
  runSeconds: 0,
};

export default function Home() {
  const { updateSessionDisplayName, signOut } = useAuth();
  const [tab, setTab] = useState<AppTabId>("play");
  const [playStage, setPlayStage] = useState<PlayStage>("home");
  const [word, setWord] = useState("படி");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState<PipelineResult | null>(null);
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);
  const [selectedSessionKey, setSelectedSessionKey] = useState<string | null>(null);

  const [gameMode, setGameMode] = useState<LexifydGameMode>("custom");
  const [hud, setHud] = useState<RunHud>(initialHud);
  const [runActive, setRunActive] = useState(false);
  const [arcadeIndex, setArcadeIndex] = useState(0);
  /** Adaptive offset for Arcade (generous) vs Boss (strict) — reset when a timed run starts */
  const [runPressureDelta, setRunPressureDelta] = useState(0);
  const queueRef = useRef<string[]>([]);
  const runIndexRef = useRef(0);
  const runXpStartRef = useRef(0);
  const runHudSnapshotRef = useRef<RunHud>(initialHud);
  const runWordsRef = useRef<string[]>([]);

  const [accessibilityMCQ, setAccessibilityMCQ] = useState(false);
  const [activeSenseId, setActiveSenseId] = useState<string | null>(null);
  const [roundMeta, setRoundMeta] = useState({ idx: 0, total: 0 });

  const [xp, setXp] = useState(0);
  const [oli, setOli] = useState(3);
  const [nickname, setNickname] = useState("");
  const [streakDays, setStreakDays] = useState(0);
  const [achievementVersion, setAchievementVersion] = useState(0);
  const [toastDefs, setToastDefs] = useState<typeof ACHIEVEMENTS>([]);
  const [runRecap, setRunRecap] = useState<RunRecapData | null>(null);
  const [eventCode, setEventCode] = useState("demo");
  const [lbRows, setLbRows] = useState(() => loadLeaderboard("demo"));
  const [weak, setWeak] = useState<string[]>([]);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dailyQuestSnap, setDailyQuestSnap] = useState({ qualifiedToday: false });
  const [lastSession, setLastSession] = useState<DetailedSessionRecord | null>(null);
  const [modeSplashOpen, setModeSplashOpen] = useState(false);
  const [splashMode, setSplashMode] = useState<LexifydGameMode>("daily");

  const dragTotalRef = useRef(0);

  const customLemmaOptions = useMemo(() => listCustomPlayWords(), []);
  const dismissToasts = useCallback(() => {
    setToastDefs([]);
  }, []);

  useEffect(() => {
    const p = loadProgression();
    setXp(p.xp);
    setOli(p.oli);
    setNickname(p.nickname);
    setStreakDays(p.streakDays);
    setDailyQuestSnap(getDailyQuestSnapshot());
    dragTotalRef.current = p.dragCorrectTotal;
    try {
      const s = localStorage.getItem(SOUND_KEY);
      if (s === "0") setSoundEnabled(false);
    } catch {
      /* ignore */
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const h = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) setHistory(parseHistoryRaw(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setWeak(weakestWords(6));
  }, [pipeline?.inputWord, history.length]);

  const sessionInsights = useMemo(
    () => computeHistoryInsights(history, loadMastery()),
    [history]
  );
  const activityRows = useMemo(() => recentActivityFromHistory(history), [history]);
  const dailyQuestWordList = useMemo(() => getDailyQuestWords(), []);
  const dailyWordsLeftSidebar = useMemo(() => {
    if (dailyQuestSnap.qualifiedToday) return 0;
    if (runActive && gameMode === "daily" && dailyQuestWordList.length > 0) {
      return Math.max(0, dailyQuestWordList.length - arcadeIndex);
    }
    return dailyQuestWordList.length;
  }, [
    arcadeIndex,
    dailyQuestSnap.qualifiedToday,
    dailyQuestWordList.length,
    gameMode,
    runActive,
  ]);

  const progressionLive = loadProgression();

  const reviewWords = useMemo(
    () => mergeReviewQueueWords(weak, sessionInsights.weakWords),
    [weak, sessionInsights.weakWords]
  );

  const exportHistoryBundle = useCallback(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      const sessions = raw ? JSON.parse(raw) : [];
      const bundle = {
        exportedAt: new Date().toISOString(),
        sessions,
        progression: loadProgression(),
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lexifyd-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!runActive) return;
    const id = window.setInterval(() => {
      setHud((h) => ({ ...h, runSeconds: h.runSeconds + 1 }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [runActive]);

  const persistSession = useCallback((record: DetailedSessionRecord) => {
    setHistory((h) => {
      const next = [record, ...h].slice(0, 20);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const syncNickname = useCallback(
    (n: string) => {
      setNickname(n);
      updateSessionDisplayName(n);
    },
    [updateSessionDisplayName]
  );

  const handleSpendOli = useCallback((n: number) => {
    if (spendOli(n)) {
      setOli((o) => o - n);
      return true;
    }
    return false;
  }, []);

  const handleOliEarn = useCallback(() => {
    const s = earnOli(1);
    setOli(s.oli);
  }, []);

  const fetchPipeline = useCallback(async (w: string, options?: { afterLoad?: "game" }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: w }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || res.statusText);
      }
      const data = (await res.json()) as PipelineResult;
      setPipeline(data);
      if (options?.afterLoad === "game") setPlayStage("game");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setPipeline(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const pw = sessionStorage.getItem("lexifyd_pending_practice");
      if (!pw) return;
      sessionStorage.removeItem("lexifyd_pending_practice");
      setWord(pw);
      setTab("play");
      void fetchPipeline(pw, { afterLoad: "game" });
    } catch {
      /* ignore */
    }
  }, [fetchPipeline]);

  const loadChallenge = useCallback(() => {
    void fetchPipeline(word, { afterLoad: "game" });
  }, [fetchPipeline, word]);

  const startRun = useCallback(
    (mode: "arcade" | "boss" | "daily", q: string[]) => {
      queueRef.current = q;
      runWordsRef.current = [];
      runIndexRef.current = 0;
      setArcadeIndex(0);
      setRunPressureDelta(0);
      setRunActive(true);
      setHud({ ...initialHud, combo: 1, runSeconds: 0 });
      runHudSnapshotRef.current = { ...initialHud, runSeconds: 0 };
      runXpStartRef.current = loadProgression().xp;
      setGameMode(mode);
      const first = q[0];
      if (first) {
        setWord(first);
        void fetchPipeline(first, { afterLoad: "game" });
      }
    },
    [fetchPipeline]
  );

  const onDailyQuestStart = useCallback(() => {
    const q = getDailyQuestWords();
    if (!q.length) return;
    startRun("daily", q);
  }, [startRun]);

  const onArcadeStart = useCallback(() => {
    startRun("arcade", getShuffledSeedQueue().slice(0, 5));
  }, [startRun]);

  const onBossStart = useCallback(() => {
    startRun("boss", getBossSeedQueue());
  }, [startRun]);

  const awardXp = useCallback((amount: number) => {
    const { state, leveledUp, newLevel } = addXp(amount);
    setXp(state.xp);
    if (leveledUp && soundEnabled) {
      playLevelUp();
    }
    return { leveledUp, newLevel };
  }, [soundEnabled]);

  const onRoundComplete = useCallback(
    (p: {
      correct: boolean;
      elapsedSec: number;
      usedDrag: boolean;
      senseId: string;
    }) => {
      const { correct, elapsedSec, usedDrag } = p;
      if (correct) {
        awardXp(12);
      }
      if (usedDrag && correct) {
        const pr = loadProgression();
        const nextDrag = pr.dragCorrectTotal + 1;
        saveProgression({ dragCorrectTotal: nextDrag });
        dragTotalRef.current = nextDrag;
      }

      if (!runActive) return;
      if (gameMode === "arcade" || gameMode === "boss") {
        setRunPressureDelta((d) => nextPressureDelta(gameMode, d, correct));
      }
      setHud((h) => {
        const pts = computeRoundPoints(correct, h.streak, elapsedSec);
        const nextStreak = correct ? h.streak + 1 : 0;
        const nextCombo = correct ? Math.min((h.combo || 1) + 1, 5) : 1;
        const peakCombo = correct ? nextCombo : (h.combo || 1);
        const pr = loadProgression();
        const nextBest = Math.max(pr.bestComboEver ?? 1, peakCombo);
        if (nextBest > (pr.bestComboEver ?? 1)) {
          saveProgression({ bestComboEver: nextBest });
        }
        const nh = {
          ...h,
          score: h.score + pts,
          streak: nextStreak,
          bestStreak: Math.max(h.bestStreak, nextStreak),
          combo: nextCombo,
        };
        runHudSnapshotRef.current = nh;
        return nh;
      });
    },
    [awardXp, gameMode, runActive]
  );

  const fireAchievements = useCallback(
    (extra: Partial<Parameters<typeof evaluateAchievements>[0]>) => {
      const st = loadProgression();
      const newly = evaluateAchievements({
        perfectThisSession: !!extra.perfectThisSession,
        wordsPlayedUnique: Object.keys(loadMastery()).length,
        streakDays: st.streakDays,
        bossJustCleared: !!extra.bossJustCleared,
        arcadeJustCleared: !!extra.arcadeJustCleared,
        dragCorrectTotal: st.dragCorrectTotal,
        ...extra,
      });
      if (newly.length) {
        const defs = newly
          .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
          .filter(Boolean) as typeof ACHIEVEMENTS;
        setToastDefs(defs);
        setAchievementVersion((v) => v + 1);
      }
    },
    []
  );

  const handleSessionEnd = useCallback(
    (s: {
      total: number;
      correct: number;
      bySense: Record<string, boolean>;
      rounds: SessionRoundLog[];
    }) => {
      const w = pipeline?.inputWord ?? word;
      let saved: DetailedSessionRecord | null = null;
      if (w) {
        saved = {
          v: 2,
          id: newSessionId(),
          at: new Date().toISOString(),
          word: w,
          mode: gameMode,
          correct: s.correct,
          total: s.total,
          rounds: s.rounds,
        };
        persistSession(saved);
        recordWordResult(w, s.correct, s.total);
        const pr = loadProgression();
        saveProgression({
          wordsPlayed: pr.wordsPlayed + 1,
          perfectWords:
            pr.perfectWords + (s.correct === s.total && s.total > 0 ? 1 : 0),
        });
        if (s.correct === s.total && s.total > 0) {
          awardXp(35);
        }
        if (runActive) {
          runWordsRef.current = [...runWordsRef.current, w];
        }
      }

      const perfect = s.total > 0 && s.correct === s.total;
      fireAchievements({
        perfectThisSession: perfect,
        wordsPlayedUnique: Object.keys(loadMastery()).length,
        dragCorrectTotal: dragTotalRef.current,
      });

      if (runActive && queueRef.current.length > 0) {
        const next = runIndexRef.current + 1;
        if (next < queueRef.current.length) {
          runIndexRef.current = next;
          setArcadeIndex(next);
          const nw = queueRef.current[next]!;
          setWord(nw);
          void fetchPipeline(nw, { afterLoad: "game" });
          return;
        }
        const mode = gameMode;
        const words = runWordsRef.current;
        const rh = runHudSnapshotRef.current;
        const xpEnd = loadProgression().xp;
        const xpGained = Math.max(0, xpEnd - runXpStartRef.current);
        if (mode === "boss") {
          saveProgression({ bossClears: loadProgression().bossClears + 1 });
          fireAchievements({ bossJustCleared: true, wordsPlayedUnique: Object.keys(loadMastery()).length });
        }
        if (mode === "arcade") {
          saveProgression({ arcadeClears: loadProgression().arcadeClears + 1 });
          fireAchievements({ arcadeJustCleared: true, wordsPlayedUnique: Object.keys(loadMastery()).length });
        }
        if (mode === "daily") {
          const r = recordDailyQuestComplete();
          setStreakDays(r.streakDays);
          setDailyQuestSnap(getDailyQuestSnapshot());
        }
        if (mode === "arcade" || mode === "boss") {
          setRunRecap(
            buildRunRecap(
              mode,
              words,
              rh.score,
              xpGained,
              rh.bestStreak,
              rh.runSeconds,
              words.length * 2
            )
          );
        }
        setRunActive(false);
        setPlayStage("home");
      }

      if (saved) {
        setLastSession(saved);
      }
      setTab("summary");
    },
    [
      awardXp,
      fetchPipeline,
      fireAchievements,
      gameMode,
      persistSession,
      pipeline,
      runActive,
      word,
    ]
  );

  const runDemo = useCallback(() => {
    setGameMode("custom");
    setRunActive(false);
    setTab("play");
    const demoWord = "படி";
    setWord(demoWord);
    void fetchPipeline(demoWord, { afterLoad: "game" });
    window.requestAnimationFrame(() => {
      document.getElementById("play-zone")?.scrollIntoView({ behavior: "smooth" });
    });
  }, [fetchPipeline]);

  const goPlayHome = useCallback(() => {
    setModeSplashOpen(false);
    setTab("play");
    setPlayStage("home");
  }, []);

  const openModeSplash = useCallback((m: LexifydGameMode) => {
    setSplashMode(m);
    setModeSplashOpen(true);
  }, []);

  const handleModeSplashBegin = useCallback(() => {
    setModeSplashOpen(false);
    void resumeAudioContext();
    if (splashMode === "custom") {
      const w = word.trim();
      if (!w) return;
      void fetchPipeline(w, { afterLoad: "game" });
      return;
    }
    if (splashMode === "daily") {
      const q = getDailyQuestWords();
      if (!q.length) return;
      startRun("daily", q);
      setPlayStage("game");
      return;
    }
    if (splashMode === "arcade") {
      startRun("arcade", getShuffledSeedQueue().slice(0, 5));
      setPlayStage("game");
      return;
    }
    if (splashMode === "boss") {
      startRun("boss", getBossSeedQueue());
      setPlayStage("game");
    }
  }, [splashMode, word, fetchPipeline, startRun]);

  const goPlayModes = useCallback(() => {
    setModeSplashOpen(false);
    setTab("play");
    setPlayStage("modes");
  }, []);

  const onContinueQuestFromHome = useCallback(() => {
    if (dailyQuestSnap.qualifiedToday) {
      goPlayModes();
      return;
    }
    if (runActive && gameMode === "daily") {
      setPlayStage("game");
      window.requestAnimationFrame(() => {
        document.getElementById("play-zone")?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }
    onDailyQuestStart();
    setPlayStage("game");
  }, [dailyQuestSnap.qualifiedToday, gameMode, goPlayModes, onDailyQuestStart, runActive]);

  const onOpenDailyQuestWord = useCallback(() => {
    if (runActive && gameMode === "daily") {
      setPlayStage("game");
      return;
    }
    onDailyQuestStart();
    setPlayStage("game");
  }, [gameMode, onDailyQuestStart, runActive]);

  const startDailyFromSidebar = useCallback(() => {
    setTab("play");
    onDailyQuestStart();
    setPlayStage("game");
  }, [onDailyQuestStart]);

  const showRunHud =
    runActive && (gameMode === "arcade" || gameMode === "boss" || gameMode === "daily");
  const runPressureBaseSec =
    showRunHud && gameMode === "arcade"
      ? arcadePressureSeconds(arcadeIndex)
      : showRunHud && gameMode === "boss"
        ? BOSS_TIMER_SEC
        : null;
  const runPressureSec =
    runPressureBaseSec != null && (gameMode === "arcade" || gameMode === "boss")
      ? applyAdaptivePressureSec(gameMode, runPressureBaseSec, runPressureDelta)
      : null;
  const runPressureLabel =
    gameMode === "arcade"
      ? "Arcade — adaptive timer (extra time if you slip)"
      : gameMode === "boss"
        ? "Boss — strict clock (small recovery only)"
        : "Time pressure";

  const exploreSection = pipeline && (
    <div className="space-y-4">
      <SemanticViz graph={pipeline.graph} highlightSenseId={activeSenseId} />
      <AchievementsPanel version={achievementVersion} />
      <ReviewQueue
        words={reviewWords}
        coachLine={sessionInsights.weakWithWhy[0]?.line ?? null}
        onPractice={(w) => {
          setRunActive(false);
          queueRef.current = [];
          setWord(w);
          setTab("play");
          void fetchPipeline(w, { afterLoad: "game" });
        }}
      />
    </div>
  );

  const largePlayLayout = tab === "play" && (playStage === "home" || playStage === "modes");
  /** Larger page header whenever Play is active (home, modes, or in-game) — matches legibility of dashboard view */
  const playTabHeaderComfort = tab === "play";

  return (
    <div className="flex min-h-screen">
      <SerenSidebar
        tab={tab}
        playStage={playStage}
        nickname={nickname}
        streakDays={streakDays}
        dailyQualifiedToday={dailyQuestSnap.qualifiedToday}
        dailyWordsLeft={dailyWordsLeftSidebar}
        onTab={setTab}
        onPlayHome={goPlayHome}
        onPlayModes={goPlayModes}
        onStartDailyLesson={startDailyFromSidebar}
        onSignOut={signOut}
      />

      <div className="flex min-h-0 min-h-screen w-full min-w-0 flex-1 flex-col md:ml-[15rem] lg:ml-64">
        <main
          className={`flex min-h-0 w-full max-w-none flex-1 flex-col py-6 pb-28 md:py-6 md:pb-24 ${
            largePlayLayout
              ? "px-5 md:px-12 lg:px-16 xl:px-20 2xl:px-24"
              : "px-5 md:px-10 lg:px-14 xl:px-16"
          }`}
        >
          <AchievementToast items={toastDefs} onDismiss={dismissToasts} />
          <RunRecap
            data={runRecap}
            onClose={() => setRunRecap(null)}
            onSaveLeaderboard={() => {
              const rows = pushLeaderboardScore(
                nickname || "Player",
                runRecap?.runScore ?? 0,
                eventCode || "default"
              );
              setLbRows(rows);
            }}
          />

          <SerenPlayHeader
            tab={tab}
            onDemo={runDemo}
            onSignOut={signOut}
            comfort={playTabHeaderComfort}
            soundEnabled={soundEnabled}
            onSoundToggle={(on) => {
              setSoundEnabled(on);
              try {
                localStorage.setItem(SOUND_KEY, on ? "1" : "0");
              } catch {
                /* ignore */
              }
            }}
          />

          <SerenPlayerStrip
            nickname={nickname}
            onNicknameChange={syncNickname}
            streakDays={streakDays}
            xp={xp}
            dailyQualifiedToday={dailyQuestSnap.qualifiedToday}
            dailyRunWordIndex={runActive && gameMode === "daily" ? arcadeIndex : undefined}
            runActiveDaily={runActive && gameMode === "daily"}
            comfort={largePlayLayout}
          />

          <AppTabs
            active={tab}
            playStage={playStage}
            onChange={setTab}
            onPlayHome={goPlayHome}
            onPlayModes={goPlayModes}
            comfort={largePlayLayout}
          />

          <div
            key={`${tab}-${playStage}`}
            className={`lex-fade-in flex min-h-0 min-h-[50vh] flex-1 flex-col ${largePlayLayout ? "lex-dashboard-xl" : ""}`}
          >
      {tab === "play" && playStage === "home" && (
        <SerenHomeDashboard
          nickname={nickname}
          streakDays={streakDays}
          wordsPlayed={progressionLive.wordsPlayed}
          bestComboEver={progressionLive.bestComboEver ?? 1}
          dailyQualifiedToday={dailyQuestSnap.qualifiedToday}
          insights={sessionInsights}
          activity={activityRows}
          leaderboard={lbRows}
          leaderboardMeNick={nickname || "Player"}
          gameMode={gameMode}
          runActive={runActive}
          dailyRunIndex={arcadeIndex}
          onContinueQuest={onContinueQuestFromHome}
          onBrowseModes={goPlayModes}
          onOpenDailyWord={onOpenDailyQuestWord}
        />
      )}

      {tab === "play" && playStage === "modes" && (
        <div className="lex-modes-scroll">
          <div className="lex-modes-inner">
            <div className="lex-section-lbl mt-1">Choose Your Pathway</div>
            <section
              className={`mb-8 flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm ${
                largePlayLayout ? "gap-7 p-7 md:p-10" : "mb-6 gap-5 p-5 md:p-7"
              }`}
            >
              <GameShell
                mode={gameMode}
                onModeChange={(m) => {
                  setGameMode(m);
                  if (runActive) {
                    setRunActive(false);
                    queueRef.current = [];
                  }
                }}
                onPathwayPreview={openModeSplash}
                onDailyQuestStart={() => {
                  onDailyQuestStart();
                  setPlayStage("game");
                }}
                onArcadeStart={() => {
                  onArcadeStart();
                  setPlayStage("game");
                }}
                onBossStart={() => {
                  onBossStart();
                  setPlayStage("game");
                }}
                hud={hud}
                showStats={showRunHud}
                visualVariant="serene"
                comfort={largePlayLayout}
              />
              {gameMode === "custom" && (
                <div className={`lex-modes-custom flex flex-col ${largePlayLayout ? "gap-5" : "gap-3"}`}>
                  <div className="lex-g-card-title">Load custom challenge</div>
                  <div className={`flex flex-col sm:flex-row sm:items-end ${largePlayLayout ? "gap-5" : "gap-3"}`}>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <label
                        htmlFor="custom-lemma-pick"
                        className={`font-medium text-[var(--muted)] ${largePlayLayout ? "text-base" : "text-ui"}`}
                      >
                        Choose from WordNet / offline lemmas
                      </label>
                      <select
                        id="custom-lemma-pick"
                        className={`lex-input w-full max-w-none font-tamil md:max-w-2xl ${largePlayLayout ? "py-3.5 text-lg" : "text-base"}`}
                        aria-label="Pick a lemma from the bundled list"
                        value={customLemmaOptions.includes(word.trim()) ? word.trim() : ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v) setWord(v);
                        }}
                      >
                        <option value="">— Scroll to pick a word (optional) —</option>
                        {customLemmaOptions.map((w) => (
                          <option key={w} value={w}>
                            {w} ({tamilToTanglish(w)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={loadChallenge}
                      className={`lex-btn-primary shrink-0 ${largePlayLayout ? "min-h-[52px] px-8 text-base" : ""}`}
                    >
                      {loading ? "Loading…" : "Load challenge"}
                    </button>
                  </div>
                  <p className={`text-[var(--muted)] ${largePlayLayout ? "text-base leading-relaxed" : "text-[11px]"}`}>
                    Quick picks:{" "}
                    {["படி", "கால்", "தலை", "விழி", "நாள்"].map((w) => (
                      <button
                        key={w}
                        type="button"
                        className={`mx-1 font-tamil text-[var(--accent)] underline decoration-[color-mix(in_srgb,var(--accent)_35%,transparent)] ${largePlayLayout ? "text-lg" : ""}`}
                        onClick={() => setWord(w)}
                      >
                        {w}
                      </button>
                    ))}
                  </p>
                </div>
              )}
              {error && <p className="text-ui text-[var(--danger)]">{error}</p>}
              {pipeline?.source === "error" && pipeline.generationNotes && (
                <p className="text-ui text-amber-800 dark:text-amber-200/90">{pipeline.generationNotes}</p>
              )}
            </section>
          </div>
        </div>
      )}

      {tab === "play" && playStage === "game" && (
        <div id="play-zone" className="relative flex min-h-[min(70vh,720px)] flex-1 flex-col space-y-4">
          <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-[var(--bg)] to-transparent md:left-[15rem] lg:left-64" />
          {loading && <ChallengeSkeleton />}
          {!loading && pipeline && pipeline.rounds.length > 0 ? (
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
              <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] blur-3xl" />
              <div className="relative flex min-h-0 flex-1 flex-col p-4 md:p-8">
                <DragDropGame
                  key={`${pipeline.inputWord}-${arcadeIndex}`}
                  senses={pipeline.senses}
                  rounds={pipeline.rounds}
                  accessibilityMCQ={accessibilityMCQ}
                  onAccessibilityChange={setAccessibilityMCQ}
                  onSessionEnd={handleSessionEnd}
                  onRoundComplete={(p) =>
                    onRoundComplete({
                      correct: p.correct,
                      elapsedSec: p.elapsedSec,
                      usedDrag: p.usedDrag,
                      senseId: p.senseId,
                    })
                  }
                  onActiveSenseChange={setActiveSenseId}
                  onRoundMeta={setRoundMeta}
                  oliBalance={oli}
                  onSpendOli={handleSpendOli}
                  onOliEarn={handleOliEarn}
                  arcadePressureSec={runPressureSec}
                  pressureLabel={runPressureLabel}
                  hintsDisabled={gameMode === "boss"}
                  hintUsesPerRound={gameMode === "boss" ? undefined : HINT_USES_PER_ROUND}
                  timedPressureMode={
                    showRunHud && gameMode === "arcade"
                      ? "arcade"
                      : showRunHud && gameMode === "boss"
                        ? "boss"
                        : null
                  }
                  soundEnabled={soundEnabled}
                  reducedMotion={reducedMotion}
                  layoutVariant="parchment"
                  parchmentHud={{
                    modeLabel: gameMode.toUpperCase(),
                    word: pipeline?.inputWord ?? word,
                    score: hud.score,
                    combo: hud.combo || 1,
                    showRun: showRunHud,
                  }}
                />
              </div>
            </div>
          ) : !loading ? (
            <div className="lex-card p-8 text-center">
              <p className="text-[var(--text)]">No challenge loaded yet.</p>
              <p className="mt-3 text-ui leading-relaxed text-[var(--muted)]">
                Open <strong>Modes</strong>, pick Custom and <strong>Load challenge</strong>, or start Daily / Arcade /
                Boss.
              </p>
              <button type="button" onClick={goPlayModes} className="lex-btn-primary mt-5">
                Browse modes
              </button>
            </div>
          ) : null}
        </div>
      )}

      {tab === "summary" && (
        <SummaryDashboard
          history={history}
          lastSession={lastSession}
          selectedSessionKey={selectedSessionKey}
          onSelectSession={setSelectedSessionKey}
          onClearSelection={() => setSelectedSessionKey(null)}
          streakDays={streakDays}
          dailyQualifiedToday={dailyQuestSnap.qualifiedToday}
          onGoPlay={() => {
            setSelectedSessionKey(null);
            setTab("play");
            setPlayStage("home");
          }}
          onPracticeWord={(w) => {
            setRunActive(false);
            queueRef.current = [];
            setWord(w);
            setTab("play");
            void fetchPipeline(w, { afterLoad: "game" });
          }}
          onExportHistory={exportHistoryBundle}
        />
      )}

      {tab === "explore" && (
        <div className="space-y-5">
          {!pipeline && (
            <div className="lex-card p-8 text-center">
              <p className="text-ui-lg font-medium text-[var(--text)]">Explore needs a loaded challenge</p>
              <p className="mt-2 text-ui leading-relaxed text-[var(--muted)]">
                Generate a word in Play to see the semantic graph and your review queue here.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTab("play");
                  setPlayStage("home");
                }}
                className="lex-btn-primary mt-6"
              >
                Go to Play
              </button>
            </div>
          )}
          {exploreSection}
        </div>
      )}

      </div>

          <footer
            className={`mt-16 border-t border-[var(--border-muted)] text-center font-body leading-relaxed text-[var(--muted-2)] ${largePlayLayout ? "lex-footer-comfort" : "pt-8 text-ui-sm"}`}
          >
            Lexifyd — automation-first, human-in-the-loop for production quality.
          </footer>
        </main>
      </div>

      <SerenMobileNav
        tab={tab}
        playStage={playStage}
        onTab={setTab}
        onPlayHome={goPlayHome}
        onPlayModes={goPlayModes}
      />

      <ModeSplashOverlay
        open={modeSplashOpen}
        mode={splashMode}
        soundEnabled={soundEnabled}
        beginDisabled={splashMode === "custom" && !word.trim()}
        onClose={() => setModeSplashOpen(false)}
        onBegin={handleModeSplashBegin}
      />
    </div>
  );
}
