"use client";

import { SummaryFold } from "@/components/SummaryFold";
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
          <SummaryFold
            kicker="Daily path"
            title="Daily Quest"
            subtitle={
              dailyQualifiedToday
                ? "Completed today — streak updated. Expand for the full trail."
                : wordsLeft > 0
                  ? `${wordsLeft} word${wordsLeft === 1 ? "" : "s"} left — expand to play the next step.`
                  : "Open to see today’s trail or jump in from Modes."
            }
            defaultOpen
            meta={
              <span className="flex items-center text-[10px] font-bold text-[var(--success)]">
                <span className="lex-live-dot" />
                LIVE
              </span>
            }
          >
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              {dailyWords.map((w, i) => {
                const st = rowState(i);
                const ic = st === "done" ? "✓" : st === "cur" ? "▶" : "🔒";
                const rom = tamilToTanglish(w).trim();
                const clickable = st === "cur";
                return (
                  <div
                    key={w}
                    className={`flex min-h-[112px] gap-3 rounded-2xl border-2 p-3 md:min-h-[120px] md:gap-4 md:p-4 ${
                      st === "done"
                        ? "border-[color-mix(in_srgb,var(--success)_45%,var(--border))] bg-[color-mix(in_srgb,var(--success)_10%,var(--card))] shadow-[0_3px_0_color-mix(in_srgb,var(--success)_28%,transparent)]"
                        : st === "cur"
                          ? "cursor-pointer border-[color-mix(in_srgb,var(--gold)_50%,var(--border))] bg-[color-mix(in_srgb,var(--gold-bg)_65%,var(--card))] shadow-[0_4px_0_color-mix(in_srgb,var(--gold)_30%,transparent)] transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
                          : "border-[var(--border)] bg-[color-mix(in_srgb,var(--card-elevated)_92%,var(--bg))] opacity-[0.88]"
                    }`}
                    onClick={clickable ? () => onOpenDailyWord(w) : undefined}
                    onKeyDown={
                      clickable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onOpenDailyWord(w);
                            }
                          }
                        : undefined
                    }
                    role={clickable ? "button" : undefined}
                    tabIndex={clickable ? 0 : undefined}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg md:h-14 md:w-14 md:text-xl ${
                        st === "done"
                          ? "bg-[color-mix(in_srgb,var(--success)_18%,var(--card))] text-[var(--success)] ring-2 ring-[color-mix(in_srgb,var(--success)_35%,transparent)]"
                          : st === "cur"
                            ? "bg-[color-mix(in_srgb,var(--gold)_22%,var(--card))] text-[var(--gold)] ring-2 ring-[color-mix(in_srgb,var(--gold)_40%,transparent)]"
                            : "bg-[var(--border-muted)] text-[var(--muted)] grayscale-[0.2]"
                      }`}
                      aria-hidden
                    >
                      {ic}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-body text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-tamil text-lg font-bold text-[var(--text)] md:text-xl">{w}</span>
                        {rom ? (
                          <span className="font-body text-xs font-medium text-[color-mix(in_srgb,var(--muted)_35%,var(--text))]">
                            ({rom})
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-snug text-[color-mix(in_srgb,var(--muted)_25%,var(--text))] md:text-sm">
                        {glossPreview(w)}
                      </p>
                      <span className="mt-2 inline-block rounded-full border border-[color-mix(in_srgb,var(--gold)_35%,var(--border))] bg-[var(--gold-bg)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--gold)]">
                        +12 XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SummaryFold>

          <SummaryFold
            kicker="Feed"
            title="Recent activity"
            subtitle={`${activity.length} line${activity.length === 1 ? "" : "s"} — rounds, XP, and misses from your last sessions.`}
            defaultOpen={false}
            meta={<span aria-hidden>📜</span>}
          >
            <ul className="grid gap-3 pt-2">
              {activity.map((a) => {
                const rom = tamilToTanglish(a.word).trim();
                const emoji = a.kind === "ok" ? "✅" : a.kind === "badge" ? "🎖️" : "💥";
                return (
                  <li
                    key={a.id}
                    className={`flex gap-3 rounded-2xl border-2 p-3 md:p-4 ${
                      a.kind === "ok"
                        ? "border-[color-mix(in_srgb,var(--success)_40%,var(--border))] bg-[color-mix(in_srgb,var(--success)_8%,var(--card))]"
                        : a.kind === "badge"
                          ? "border-[color-mix(in_srgb,var(--gold)_45%,var(--border))] bg-[color-mix(in_srgb,var(--gold-bg)_50%,var(--card))]"
                          : "border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_6%,var(--card))]"
                    }`}
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--card-elevated)_80%,transparent)] text-xl shadow-sm"
                      aria-hidden
                    >
                      {emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <strong className="font-tamil text-base font-bold text-[var(--text)] md:text-lg">{a.word}</strong>
                        {rom ? (
                          <span className="font-body text-xs font-medium text-[var(--muted)]">({rom})</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-[color-mix(in_srgb,var(--muted)_20%,var(--text))]">
                        {a.detail}
                      </p>
                    </div>
                    <div className="shrink-0 self-start text-right text-[11px] font-semibold tabular-nums text-[var(--muted)]">
                      {a.timeLabel}
                    </div>
                  </li>
                );
              })}
            </ul>
          </SummaryFold>
        </div>

        <div className="flex flex-col gap-4">
          <SummaryFold
            kicker="Arena"
            title="Weekly rankings"
            subtitle="Local device · top scores from Arcade & Boss."
            defaultOpen={false}
            meta={<span className="text-[10px] font-bold text-[var(--gold)]">TOP 5</span>}
          >
            <div className="overflow-hidden rounded-xl border border-[var(--border)] pt-2">
              {lbDisplay.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[var(--muted)]">
                  Play Arcade or Boss and save a score.
                </div>
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
          </SummaryFold>

          <SummaryFold
            kicker="Lexicon"
            title="Word of the Day"
            subtitle={
              wotd
                ? `${wotd} (${tamilToTanglish(wotd)}) — two senses to savour.`
                : "No lemma queued for today."
            }
            defaultOpen
            meta={<span aria-hidden>✦</span>}
          >
            <div className="lex-wod pt-2">
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
          </SummaryFold>
        </div>
      </div>
    </div>
  );
}
