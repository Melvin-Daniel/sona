export function computeRoundPoints(
  correct: boolean,
  streak: number,
  elapsedSec: number
): number {
  if (!correct) return 0;
  const base = 100;
  const streakBonus = Math.min(streak, 10) * 15;
  const timeBonus = Math.max(0, Math.floor(25 - elapsedSec)) * 2;
  return base + streakBonus + timeBonus;
}
