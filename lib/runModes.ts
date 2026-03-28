/** Arcade: timer tightens each word in the run */
export const ARCADE_TIMER_START_SEC = 45;
export const ARCADE_TIMER_FLOOR_SEC = 22;
export const ARCADE_TIMER_STEP_SEC = 6;

/** Boss: fixed stricter timer per word */
export const BOSS_TIMER_SEC = 32;

export function arcadePressureSeconds(roundIndex: number): number {
  return Math.max(
    ARCADE_TIMER_FLOOR_SEC,
    ARCADE_TIMER_START_SEC - roundIndex * ARCADE_TIMER_STEP_SEC
  );
}

/** Modes that use adaptive time pressure during a multi-word run */
export type TimedRunMode = "arcade" | "boss";

/**
 * Accumulated offset (seconds) applied on top of the base timer for the next round.
 * Updated after each round via `nextPressureDelta`. Clamped per mode.
 */
export function clampPressureDelta(mode: TimedRunMode, delta: number): number {
  if (mode === "arcade") {
    return Math.max(-14, Math.min(22, delta));
  }
  return Math.max(-8, Math.min(6, delta));
}

/**
 * Effective seconds for this round: base (from index / boss constant) plus adaptive delta,
 * then clamped to mode-specific absolute bounds.
 */
export function applyAdaptivePressureSec(
  mode: TimedRunMode,
  baseSec: number,
  delta: number
): number {
  const d = clampPressureDelta(mode, delta);
  const raw = Math.round(baseSec + d);
  if (mode === "arcade") {
    return Math.max(16, Math.min(56, raw));
  }
  return Math.max(22, Math.min(40, raw));
}

/**
 * Arcade: friendly — strong recovery on miss, noticeable tighten on success.
 * Boss: strict — small recovery, modest tighten (stays closer to base).
 */
export function nextPressureDelta(
  mode: TimedRunMode,
  prev: number,
  correct: boolean
): number {
  const p = clampPressureDelta(mode, prev);
  if (mode === "arcade") {
    if (correct) return clampPressureDelta(mode, p - 5);
    return clampPressureDelta(mode, p + 8);
  }
  if (correct) return clampPressureDelta(mode, p - 2);
  return clampPressureDelta(mode, p + 3);
}
