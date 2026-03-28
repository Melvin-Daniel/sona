"use client";

import type { LeaderRow } from "@/lib/mastery";
import type { ActivityRow } from "@/lib/dashboardActivity";
import type { HistoryInsights } from "@/lib/insights";
import { getDailyQuestWords, getDailySeedWord, getSeed, listSeedWords } from "@/lib/seed";
import { tamilToTanglish } from "@/lib/tanglish";
import type { LexifydGameMode } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

const LB_PALETTE = ["#c49a2a", "#1f4a3a", "#7a7260", "#5a7a90", "#8a6a50", "#6a4a2a"];

function hashNick(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function glossPreview(word: string): string {
  const o = getSeed(word);
  if (!o?.senses.length) return "—";
  return o.senses
    .map((x) => x.glossEn.split(/[;,]/)[0]!.trim())
    .slice(0, 3)
    .join(" · ");
}

function avatarLetter(nick: string): string {
  const t = nick.trim();
  if (!t) return "அ";
  const m = t.match(/[\u0B80-\u0BFF]/);
  return m ? m[0]! : t[0]!.toUpperCase();
}

type Props = {
  nickname: string;
  streakDays: number;
  wordsPlayed: number;
  bestComboEver: number;
  dailyQualifiedToday: boolean;
  insights: HistoryInsights;
  activity: ActivityRow[];
  leaderboard: LeaderRow[];
  leaderboardMeNick: string;
  gameMode: LexifydGameMode;
  runActive: boolean;
  dailyRunIndex: number;
  onContinueQuest: () => void;
  onBrowseModes: () => void;
  onOpenDailyWord: (word: string) => void;
};

export function SerenHomeDashboard({
  nickname,
  streakDays,
  wordsPlayed,
  bestComboEver,
  dailyQualifiedToday,
  insights,
  activity,
  leaderboard,
  leaderboardMeNick,
  gameMode,
  runActive,
  dailyRunIndex,
  onContinueQuest,
  onBrowseModes,
  onOpenDailyWord,
}: Props) {
  const dailyWords = useMemo(() => getDailyQuestWords(), []);
  const wotd = useMemo(() => getDailySeedWord(), []);
  const wotdSeed = useMemo(() => (wotd ? getSeed(wotd) : null), [wotd]);
  const displayName = nickname.trim() || "Scholar";
  const cycleWords = useMemo(() => listSeedWords().slice(0, 10), []);
  const [hwIdx, setHwIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setHwIdx((i) => (i + 1) % Math.max(1, cycleWords.length));
    }, 2500);
    return () => window.clearInterval(id);
  }, [cycleWords.length]);

  const heroBgWord = cycleWords[hwIdx] ?? "படி";

  const wordsLeft = useMemo(() => {
    if (runActive && gameMode === "daily" && dailyWords.length > 0) {
      return Math.max(0, dailyWords.length - dailyRunIndex);
    }
    if (dailyQualifiedToday) return 0;
    return dailyWords.length;
  }, [runActive, gameMode, dailyQualifiedToday, dailyRunIndex, dailyWords.length]);

  const acc = insights.avgAccuracyPct;
  const accDelta =
    insights.thisWeekAvgAccuracyPct != null && insights.lastWeekAvgAccuracyPct != null
      ? insights.thisWeekAvgAccuracyPct - insights.lastWeekAvgAccuracyPct
      : null;

  const lbDisplay = useMemo(() => {
    const byNick = new Map<string, LeaderRow>();
    for (const r of leaderboard) {
      const k = r.nick.trim().toLowerCase();
      const prev = byNick.get(k);
      if (!prev || r.score > prev.score) byNick.set(k, r);
    }
    const merged = Array.from(byNick.values()).sort((a, b) => b.score - a.score).slice(0, 5);
    return merged.map((r, i) => ({
      ...r,
      rk: i + 1,
      me: r.nick.trim().toLowerCase() === leaderboardMeNick.trim().toLowerCase(),
      col: LB_PALETTE[hashNick(r.nick) % LB_PALETTE.length]!,
      av: avatarLetter(r.nick),
    }));
  }, [leaderboard, leaderboardMeNick]);

  const rowState = (i: number): "done" | "cur" | "lock" => {
    if (dailyQualifiedToday) return "done";
    if (runActive && gameMode === "daily") {
      if (i < dailyRunIndex) return "done";
      if (i === dailyRunIndex) return "cur";
      return "lock";
    }
    return i === 0 ? "cur" : "lock";
  };

  return (
    <div className="lex-home-scroll">
      <div className="lex-home-grid">
        <div className="lex-hero">
          <div className="lex-hero-word-bg" aria-hidden>
            {heroBgWord}
          </div>
          <div className="lex-hero-kicker">Welcome back, {displayName} ✦</div>
          <div className="lex-hero-title">
            Today&apos;s <em>Quest</em>
            <br />
            awaits you.
          </div>
          <p className="lex-hero-sub">
            {dailyQualifiedToday
              ? "You finished today’s daily quest. Come back tomorrow or try Arcade & Boss from Modes."
              : wordsLeft > 0
                ? `${wordsLeft} word${wordsLeft === 1 ? "" : "s"} left in your daily challenge. ${streakDays > 0 ? `Keep your ${streakDays}-day streak alive.` : "Build a streak — one quest at a time."}`
                : "Pick a pathway in Modes or load a custom lemma to keep practicing."}
          </p>
          <div className="lex-hero-actions">
            <button type="button" className="lex-hero-btn" onClick={onContinueQuest}>
              ▶ Continue Quest
            </button>
            <button type="button" className="lex-hero-btn lex-hero-btn-ghost" onClick={onBrowseModes}>
              Browse Modes
            </button>
          </div>
        </div>

        <div className="lex-stats-row">
          <div className="lex-stat-card">
            <div className="lex-stat-val">{acc > 0 ? `${acc}%` : "—"}</div>
            <div className="lex-stat-lbl">Accuracy</div>
            <div className="lex-stat-delta">
              {accDelta != null && accDelta !== 0
                ? `${accDelta > 0 ? "↑" : "↓"} ${Math.abs(Math.round(accDelta))}% vs last week`
                : "Play sessions to track"}
            </div>
          </div>
          <div className="lex-stat-card">
            <div className="lex-stat-val" style={{ color: "var(--gold)" }}>
              {streakDays}
            </div>
            <div className="lex-stat-lbl">Day Streak</div>
            <div className="lex-stat-delta">{streakDays >= 7 ? "Personal best energy!" : "Keep the chain"}</div>
          </div>
          <div className="lex-stat-card">
            <div className="lex-stat-val">{wordsPlayed}</div>
            <div className="lex-stat-lbl">Words</div>
            <div className="lex-stat-delta">
              {insights.sessionsLast7Days > 0 ? `↑ ${insights.sessionsLast7Days} sess. this week` : "Your library grows"}
            </div>
          </div>
          <div className="lex-stat-card">
            <div className="lex-stat-val">×{bestComboEver}</div>
            <div className="lex-stat-lbl">Best Combo</div>
            <div className="lex-stat-delta" style={{ color: "var(--muted)" }}>
              {bestComboEver >= 5 ? "Maxed!" : "Chain correct in timed runs"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="lex-section-lbl">Today&apos;s Quest</div>
          <div className="lex-panel">
            <div className="lex-panel-head">
              <div>
                <div className="lex-panel-title">Daily Quest</div>
                <div className="lex-panel-sub">
                  {dailyQualifiedToday ? "Completed today — streak updated" : "Complete all words to extend streak"}
                </div>
              </div>
              <span className="flex items-center text-[10px] font-bold text-[var(--success)]">
                <span className="lex-live-dot" />
                LIVE
              </span>
            </div>
            {dailyWords.map((w, i) => {
              const st = rowState(i);
              const ic = st === "done" ? "✓" : st === "cur" ? "→" : "·";
              return (
                <div
                  key={w}
                  className={`lex-dw-row ${st === "cur" ? "lex-dw-row-click" : ""}`}
                  onClick={st === "cur" ? () => onOpenDailyWord(w) : undefined}
                  onKeyDown={
                    st === "cur"
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onOpenDailyWord(w);
                          }
                        }
                      : undefined
                  }
                  role={st === "cur" ? "button" : undefined}
                  tabIndex={st === "cur" ? 0 : undefined}
                >
                  <span className="lex-dw-idx">{String(i + 1).padStart(2, "0")}</span>
                  <div className={`lex-dw-ring ${st}`}>{ic}</div>
                  <span className="lex-dw-word">{w}</span>
                  <span className="lex-dw-gloss">{glossPreview(w)}</span>
                  <span className="lex-dw-xp">+12</span>
                </div>
              );
            })}
          </div>

          <div className="lex-section-lbl">Recent Activity</div>
          <div className="lex-panel">
            {activity.map((a) => (
              <div key={a.id} className="lex-act-row">
                <div className={`lex-act-dot ${a.kind === "ok" ? "ok" : a.kind === "badge" ? "bd" : "bad"}`}>
                  {a.kind === "ok" ? "✓" : a.kind === "badge" ? "🎖" : "✗"}
                </div>
                <div className="lex-act-text">
                  <strong className="font-tamil text-[var(--text)]">{a.word}</strong> {a.detail}
                </div>
                <div className="lex-act-time">{a.timeLabel}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="lex-section-lbl">Leaderboard</div>
          <div className="lex-panel">
            <div className="lex-panel-head">
              <div>
                <div className="lex-panel-title">Weekly Rankings</div>
                <div className="lex-panel-sub">Local device · event code</div>
              </div>
              <span className="text-[10px] font-bold text-[var(--gold)]">TOP 5</span>
            </div>
            {lbDisplay.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-[var(--muted)]">Play Arcade or Boss and save a score.</div>
            ) : (
              lbDisplay.map((p) => (
                <div key={`${p.nick}-${p.rk}`} className={`lex-lb-row ${p.me ? "lex-lb-row-me" : ""}`}>
                  <span className="lex-lb-rank">{p.rk <= 3 ? ["🥇", "🥈", "🥉"][p.rk - 1] : p.rk}</span>
                  <div className="lex-lb-av" style={{ background: p.col }}>
                    {p.av}
                  </div>
                  <span className="lex-lb-name">
                    {p.nick}
                    {p.me ? " (you)" : ""}
                  </span>
                  <span className="lex-lb-sc">{p.score.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>

          <div className="lex-section-lbl">Word of the Day</div>
          <div className="lex-wod">
            <div className="lex-wod-label">✦ Word of the Day</div>
            <div className="lex-wod-word">{wotd || "—"}</div>
            <div className="lex-wod-rom">{wotd ? tamilToTanglish(wotd) : ""}</div>
            <div>
              {wotdSeed?.senses.map((s, i) => (
                <div key={s.id} className="lex-wod-m">
                  <span className="lex-wod-num">{i + 1}.</span>
                  <span>
                    {s.glossEn}
                    {s.meaningTa ? ` — ${s.meaningTa}` : ""}
                  </span>
                </div>
              )) ?? <div className="lex-wod-m text-[var(--muted)]">No seed entry for today.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
