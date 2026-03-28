const KEY = "lexifyd_progression_v1";

export type ProgressionState = {
  xp: number;
  nickname: string;
  oli: number;
  /** ISO date — last day the daily quest was fully completed (streak anchor) */
  lastPlayedDay: string | null;
  /** consecutive calendar days where the daily quest was completed */
  streakDays: number;
  dragCorrectTotal: number;
  wordsPlayed: number;
  perfectWords: number;
  bossClears: number;
  arcadeClears: number;
  /** ISO date — completed today’s 5-word daily quest */
  dailyQualifiedDate: string | null;
  /** Highest combo multiplier reached in any timed/custom run (UI stat) */
  bestComboEver?: number;
  /** @deprecated legacy counter — ignored for streak */
  dailyGoalDate?: string | null;
  dailyGoalCount?: number;
};

const defaultState = (): ProgressionState => ({
  xp: 0,
  nickname: "",
  oli: 3,
  lastPlayedDay: null,
  streakDays: 0,
  dragCorrectTotal: 0,
  wordsPlayed: 0,
  perfectWords: 0,
  bossClears: 0,
  arcadeClears: 0,
  dailyQualifiedDate: null,
  bestComboEver: 1,
});

export function loadProgression(): ProgressionState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const p = JSON.parse(raw) as Partial<ProgressionState>;
    return { ...defaultState(), ...p };
  } catch {
    return defaultState();
  }
}

export function saveProgression(patch: Partial<ProgressionState>): ProgressionState {
  const cur = loadProgression();
  const next = { ...cur, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export function xpToNextLevel(xp: number): { level: number; currentStart: number; nextAt: number } {
  const level = levelFromXp(xp);
  const currentStart = (level - 1) ** 2 * 50;
  const nextAt = level ** 2 * 50;
  return { level, currentStart, nextAt };
}

/** Advance calendar streak when the daily goal is met (once per day). */
export function qualifyDailyStreakDay(): { streakDays: number } {
  const p = loadProgression();
  const today = new Date().toISOString().slice(0, 10);
  const last = p.lastPlayedDay;
  if (last === today) {
    return { streakDays: p.streakDays };
  }
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let streak = p.streakDays;
  if (last === yesterday) {
    streak += 1;
  } else if (last == null) {
    streak = 1;
  } else {
    streak = 1;
  }
  saveProgression({ lastPlayedDay: today, streakDays: streak });
  return { streakDays: streak };
}

export function getDailyQuestSnapshot(): { qualifiedToday: boolean } {
  const p = loadProgression();
  const today = new Date().toISOString().slice(0, 10);
  return {
    qualifiedToday: p.dailyQualifiedDate === today,
  };
}

/** Call once when the player finishes all words in today’s daily quest */
export function recordDailyQuestComplete(): {
  streakDays: number;
  streakJustAdvanced: boolean;
} {
  const today = new Date().toISOString().slice(0, 10);
  const p = loadProgression();
  if (p.dailyQualifiedDate === today) {
    return { streakDays: p.streakDays, streakJustAdvanced: false };
  }
  const before = p.streakDays;
  qualifyDailyStreakDay();
  saveProgression({ dailyQualifiedDate: today });
  const after = loadProgression();
  return {
    streakDays: after.streakDays,
    streakJustAdvanced: after.streakDays !== before || before === 0,
  };
}

export function addXp(amount: number): { state: ProgressionState; leveledUp: boolean; oldLevel: number; newLevel: number } {
  const p = loadProgression();
  const oldLevel = levelFromXp(p.xp);
  const xp = p.xp + amount;
  const newLevel = levelFromXp(xp);
  const state = saveProgression({ xp });
  return { state, leveledUp: newLevel > oldLevel, oldLevel, newLevel };
}

export function earnOli(n: number): ProgressionState {
  const p = loadProgression();
  return saveProgression({ oli: Math.min(99, p.oli + n) });
}

export function spendOli(n: number): boolean {
  const p = loadProgression();
  if (p.oli < n) return false;
  saveProgression({ oli: p.oli - n });
  return true;
}
