const KEY = "lexifyd_achievements_v1";

export type AchievementId =
  | "first_perfect"
  | "polyglot_trainee"
  | "streak_3"
  | "streak_10"
  | "boss_clear"
  | "arcade_clear"
  | "drag_purist_10";

export type AchievementDef = {
  id: AchievementId;
  title: string;
  desc: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_perfect", title: "First perfect", desc: "Get 2/2 on one word." },
  { id: "polyglot_trainee", title: "Polyglot trainee", desc: "Play 10 different words." },
  { id: "streak_3", title: "On fire", desc: "3-day play streak." },
  { id: "streak_10", title: "Dedicated", desc: "10-day play streak." },
  { id: "boss_clear", title: "Boss slayer", desc: "Finish a Boss run." },
  { id: "arcade_clear", title: "Arcade star", desc: "Finish an Arcade run." },
  { id: "drag_purist_10", title: "Drag purist", desc: "10 correct meaning drags total." },
];

export function loadUnlocked(): Set<AchievementId> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as AchievementId[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveUnlocked(set: Set<AchievementId>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* ignore */
  }
}

export type AchievementContext = {
  perfectThisSession: boolean;
  wordsPlayedUnique: number;
  streakDays: number;
  bossJustCleared: boolean;
  arcadeJustCleared: boolean;
  dragCorrectTotal: number;
};

export function evaluateAchievements(ctx: AchievementContext): AchievementId[] {
  const cur = loadUnlocked();
  const next = new Set(cur);
  const newly: AchievementId[] = [];

  const tryUnlock = (id: AchievementId, cond: boolean) => {
    if (cond && !next.has(id)) {
      next.add(id);
      newly.push(id);
    }
  };

  tryUnlock("first_perfect", ctx.perfectThisSession);
  tryUnlock("polyglot_trainee", ctx.wordsPlayedUnique >= 10);
  tryUnlock("streak_3", ctx.streakDays >= 3);
  tryUnlock("streak_10", ctx.streakDays >= 10);
  tryUnlock("boss_clear", ctx.bossJustCleared);
  tryUnlock("arcade_clear", ctx.arcadeJustCleared);
  tryUnlock("drag_purist_10", ctx.dragCorrectTotal >= 10);

  if (newly.length) saveUnlocked(next);
  return newly;
}
