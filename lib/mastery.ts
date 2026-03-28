const KEY = "lexifyd_mastery_v1";

export type WordStats = {
  plays: number;
  correctRounds: number;
  totalRounds: number;
  lastPlayed: string;
};

export type MasteryMap = Record<string, WordStats>;

export function loadMastery(): MasteryMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as MasteryMap;
  } catch {
    return {};
  }
}

function saveMastery(m: MasteryMap) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export function recordWordResult(
  word: string,
  correct: number,
  total: number
): MasteryMap {
  const m = loadMastery();
  const prev = m[word] ?? {
    plays: 0,
    correctRounds: 0,
    totalRounds: 0,
    lastPlayed: "",
  };
  m[word] = {
    plays: prev.plays + 1,
    correctRounds: prev.correctRounds + correct,
    totalRounds: prev.totalRounds + total,
    lastPlayed: new Date().toISOString(),
  };
  saveMastery(m);
  return m;
}

/** Lowest accuracy words with min plays */
export function weakestWords(limit = 3): string[] {
  const m = loadMastery();
  return Object.entries(m)
    .filter(([, s]) => s.plays > 0 && s.totalRounds > 0)
    .map(([w, s]) => ({
      w,
      acc: s.correctRounds / s.totalRounds,
      plays: s.plays,
    }))
    .sort((a, b) => a.acc - b.acc || b.plays - a.plays)
    .slice(0, limit)
    .map((x) => x.w);
}

const LB_KEY = "lexifyd_lb_default";

export type LeaderRow = { nick: string; score: number; at: string };

export function loadLeaderboard(code = "default"): LeaderRow[] {
  if (typeof window === "undefined") return [];
  const k = code ? `lexifyd_lb_${code}` : LB_KEY;
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderRow[];
  } catch {
    return [];
  }
}

export function pushLeaderboardScore(nick: string, score: number, code = "default"): LeaderRow[] {
  const k = code ? `lexifyd_lb_${code}` : LB_KEY;
  const rows = loadLeaderboard(code);
  const next: LeaderRow[] = [
    { nick: nick || "Player", score, at: new Date().toISOString() },
    ...rows,
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  try {
    localStorage.setItem(k, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
