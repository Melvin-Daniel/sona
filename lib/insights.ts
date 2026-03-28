import type { MasteryMap } from "@/lib/mastery";
import type { SessionHistoryEntry } from "@/lib/sessionHistory";
import { isDetailedSession, sessionAccuracy } from "@/lib/sessionHistory";
import { taxonomyLabel } from "@/lib/taxonomyLabels";
import type { OptionRole } from "@/lib/types";
import {
  averageAccuracyCurrentWeekPartial,
  averageAccuracyForWeekOffset,
} from "@/lib/weeklySessions";

export type SessionHistoryRow = {
  at: string;
  word: string;
  correct: number;
  total: number;
};

export type HistoryInsights = {
  weakWords: string[];
  strongWords: string[];
  tips: string[];
  sessionCount: number;
  avgAccuracyPct: number;
  /** Last N sessions accuracy % for trend (oldest → newest) */
  trendAccuracyPct: number[];
  /** Sessions whose `at` falls in the last 7 calendar days */
  sessionsLast7Days: number;
  /** Wrong-answer counts by distractor role (detailed sessions only) */
  distractorBreakdown: { role: string; count: number }[];
  /** Top lemmas by volume with accuracy bar */
  wordAccuracyBars: { word: string; pct: number; plays: number }[];
  /** Weak lemmas with a short “why” when detailed data exists */
  weakWithWhy: { word: string; line: string }[];
  /** Mean session accuracy this week (Mon → now), null if no sessions */
  thisWeekAvgAccuracyPct: number | null;
  /** Mean session accuracy last full calendar week (Mon–Sun), null if none */
  lastWeekAvgAccuracyPct: number | null;
};

/**
 * Rank words for Explore review: mastery-weak first when also in insight weak list, then rest.
 */
export function mergeReviewQueueWords(
  masteryWeak: string[],
  insightWeakWords: string[],
  limit = 6
): string[] {
  const iSet = new Set(insightWeakWords);
  const out: string[] = [];
  const push = (w: string) => {
    if (out.includes(w) || out.length >= limit) return;
    out.push(w);
  };
  for (const w of masteryWeak) {
    if (iSet.has(w)) push(w);
  }
  for (const w of masteryWeak) {
    if (!iSet.has(w)) push(w);
  }
  for (const w of insightWeakWords) {
    push(w);
  }
  return out;
}

function isWithinLastDays(isoAt: string, days: number): boolean {
  const t = new Date(isoAt).getTime();
  if (Number.isNaN(t)) return false;
  return t >= Date.now() - days * 86400000;
}

function wordBarsFromMastery(mastery: MasteryMap): HistoryInsights["wordAccuracyBars"] {
  return Object.entries(mastery)
    .filter(([, s]) => s.totalRounds > 0)
    .map(([word, s]) => ({
      word,
      pct: Math.round((s.correctRounds / s.totalRounds) * 100),
      plays: s.plays,
      volume: s.totalRounds,
    }))
    .sort((a, b) => b.volume - a.volume || b.plays - a.plays)
    .slice(0, 15)
    .map(({ word, pct, plays }) => ({ word, pct, plays }));
}

/** Rule-based coaching from session entries (legacy + detailed) + optional lifetime mastery stats. */
export function computeHistoryInsights(
  entries: SessionHistoryEntry[],
  mastery?: MasteryMap | null
): HistoryInsights {
  const masteryBars =
    mastery && Object.keys(mastery).length > 0 ? wordBarsFromMastery(mastery) : [];

  if (!entries.length) {
    return {
      weakWords: [],
      strongWords: [],
      tips:
        masteryBars.length > 0
          ? [
              "Open Recent sessions after each play-through to see trends. Words by volume use your full practice history on this device.",
            ]
          : ["Play a few sessions to see strengths, weak words, and tips here."],
      sessionCount: 0,
      avgAccuracyPct: 0,
      trendAccuracyPct: [],
      sessionsLast7Days: 0,
      distractorBreakdown: [],
      wordAccuracyBars: masteryBars,
      weakWithWhy: [],
      thisWeekAvgAccuracyPct: null,
      lastWeekAvgAccuracyPct: null,
    };
  }

  const byWord = new Map<string, { accSum: number; n: number }>();
  let accTotal = 0;
  const roleCounts = new Map<string, number>();
  const wrongRolesByWord = new Map<string, Map<string, number>>();

  for (const r of entries) {
    const t = Math.max(1, r.total);
    const acc = r.correct / t;
    accTotal += acc;
    const cur = byWord.get(r.word) ?? { accSum: 0, n: 0 };
    cur.accSum += acc;
    cur.n += 1;
    byWord.set(r.word, cur);

    if (isDetailedSession(r)) {
      for (const round of r.rounds) {
        if (!round.correct && round.pickedRole && round.pickedRole !== "correct") {
          roleCounts.set(round.pickedRole, (roleCounts.get(round.pickedRole) ?? 0) + 1);
          const wm = wrongRolesByWord.get(r.word) ?? new Map<string, number>();
          wm.set(round.pickedRole, (wm.get(round.pickedRole) ?? 0) + 1);
          wrongRolesByWord.set(r.word, wm);
        }
      }
    }
  }

  const scored = Array.from(byWord.entries()).map(([word, { accSum, n }]) => ({
    word,
    rate: accSum / n,
    n,
  }));
  scored.sort((a, b) => a.rate - b.rate);

  const weakWords = scored.filter((s) => s.rate < 0.75).slice(0, 5).map((s) => s.word);
  const strongWords = [...scored]
    .filter((s) => s.rate >= 0.85)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5)
    .map((s) => s.word);

  const distractorBreakdown = Array.from(roleCounts.entries())
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count);

  const trendAccuracyPct = entries
    .slice(0, 20)
    .reverse()
    .map((e) => Math.round(sessionAccuracy(e) * 100));

  const sessionsLast7Days = entries.filter((e) => isWithinLastDays(e.at, 7)).length;

  const wordAccuracyBars =
    masteryBars.length > 0
      ? masteryBars
      : [...scored]
          .sort((a, b) => b.n - a.n)
          .slice(0, 12)
          .map((s) => ({
            word: s.word,
            pct: Math.round(s.rate * 100),
            plays: s.n,
          }));

  const weakWithWhy: { word: string; line: string }[] = [];
  const topGlobalDistractor = distractorBreakdown[0];

  for (const w of weakWords.slice(0, 6)) {
    const m = wrongRolesByWord.get(w);
    if (m && m.size > 0) {
      const top = Array.from(m.entries()).sort((a, b) => b[1] - a[1])[0];
      if (!top) continue;
      const [role, n] = top;
      const label = taxonomyLabel(role as OptionRole);
      weakWithWhy.push({
        word: w,
        line: `Most often slips on “${label}” (${n}×) when a wrong MCQ choice was recorded — read the pedagogy line for that pick to separate similar senses.`,
      });
      continue;
    }

    const wordEntries = entries.filter((e) => e.word === w);
    const detailedForWord = wordEntries.filter(isDetailedSession);
    const wrongRoundTotal = detailedForWord.reduce(
      (acc, e) => acc + e.rounds.filter((r) => !r.correct).length,
      0
    );
    const wrongWithTaggedDistractor = detailedForWord.reduce(
      (acc, e) =>
        acc +
        e.rounds.filter((r) => !r.correct && r.pickedRole && r.pickedRole !== "correct").length,
      0
    );

    const agg = byWord.get(w);
    const pctRounded = agg ? Math.round((agg.accSum / agg.n) * 100) : 0;
    const nSessions = agg?.n ?? 0;

    if (wrongRoundTotal > 0 && wrongWithTaggedDistractor === 0) {
      weakWithWhy.push({
        word: w,
        line: `${wrongRoundTotal} incorrect round(s) logged (e.g. time ran out or incomplete tagging). Turn on “Accessibility: choice cards (MCQ)” and submit a wrong numbered option once — we’ll label the distractor type for this lemma. Session average ~${pctRounded}% over ${nSessions} run(s).`,
      });
      continue;
    }

    if (detailedForWord.length === 0 && wordEntries.length > 0) {
      weakWithWhy.push({
        word: w,
        line: `Older entries are score-only (~${pctRounded}% over ${nSessions} session(s)). Newer play-throughs store each round — keep practicing this word to unlock line-by-line review below.`,
      });
      continue;
    }

    if (topGlobalDistractor && nSessions > 0) {
      const gLabel = topGlobalDistractor.role.replace(/_/g, " ");
      weakWithWhy.push({
        word: w,
        line: `Session average ~${pctRounded}% (${nSessions} play(s)). Across all words your common trap lately is “${gLabel}” (${topGlobalDistractor.count}×) — slow down on POS and fixed phrases before locking an answer.`,
      });
      continue;
    }

    weakWithWhy.push({
      word: w,
      line: `~${pctRounded}% accuracy over ${nSessions} logged session(s). Queue this lemma in Custom or Daily for spaced review.`,
    });
  }

  const tips: string[] = [];
  if (masteryBars.length > 0) {
    tips.push(
      "Words by volume use your full on-device history (every finished challenge), not just the 20 most recent sessions in the list."
    );
  }
  if (distractorBreakdown.length) {
    const top = distractorBreakdown[0]!;
    tips.push(
      `Most common error type lately: ${taxonomyLabel(top.role as OptionRole)} (${top.count} tagged misses) — read pedagogy after wrong MCQ picks to separate these traps.`
    );
  }
  if (weakWords.length) {
    tips.push(
      `Focus review on: ${weakWords.slice(0, 3).join(" · ")} — accuracy is below 75% on recent plays.`
    );
  }
  if (strongWords.length) {
    tips.push(`You’re solid on: ${strongWords.slice(0, 3).join(" · ")} — keep mixing in harder lemmas.`);
  }
  const recent = entries.slice(0, 5);
  const lastBad = recent.find((r) => r.correct < r.total);
  if (lastBad) {
    tips.push(
      `Latest miss: “${lastBad.word}” (${lastBad.correct}/${lastBad.total}). Open the session below for round-by-round detail.`
    );
  }
  if (tips.length === 0) {
    tips.push("Keep a steady mix of Daily quest + Custom practice to catch subtle polysemy traps.");
  }

  const avgAccuracyPct = Math.round((accTotal / entries.length) * 100);

  const ref = new Date();
  const twAcc = averageAccuracyCurrentWeekPartial(entries, ref);
  const lwAcc = averageAccuracyForWeekOffset(entries, ref, 1);

  return {
    weakWords,
    strongWords,
    tips,
    sessionCount: entries.length,
    avgAccuracyPct,
    trendAccuracyPct,
    sessionsLast7Days,
    distractorBreakdown,
    wordAccuracyBars,
    weakWithWhy,
    thisWeekAvgAccuracyPct: twAcc == null ? null : Math.round(twAcc * 100),
    lastWeekAvgAccuracyPct: lwAcc == null ? null : Math.round(lwAcc * 100),
  };
}
