/**
 * Count finished sessions whose `at` falls in the current calendar week (Monday 00:00 local → now).
 * Used for the Summary weekly practice goal.
 */

export const DEFAULT_WEEKLY_SESSION_TARGET = 5;

function startOfWeekMondayLocal(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function countSessionsThisWeek(
  entries: { at: string }[],
  refDate: Date = new Date()
): number {
  const start = startOfWeekMondayLocal(refDate);
  return entries.filter((e) => {
    const t = new Date(e.at).getTime();
    return !Number.isNaN(t) && t >= start.getTime();
  }).length;
}

/** Monday 00:00 local for the week that is `weeksBack` weeks before the week containing `refDate`. */
export function startOfWeekMondayOffset(refDate: Date, weeksBack: number): Date {
  const thisMonday = startOfWeekMondayLocal(refDate);
  const d = new Date(thisMonday);
  d.setDate(d.getDate() - 7 * weeksBack);
  return d;
}

/**
 * Mean session accuracy (correct/total) for entries with `at` in [start, end).
 * `end` is exclusive (typically next Monday 00:00).
 */
export function averageAccuracyInRange(
  entries: { at: string; correct: number; total: number }[],
  start: Date,
  end: Date
): number | null {
  const t0 = start.getTime();
  const t1 = end.getTime();
  const slice = entries.filter((e) => {
    const t = new Date(e.at).getTime();
    return !Number.isNaN(t) && t >= t0 && t < t1;
  });
  if (!slice.length) return null;
  let sum = 0;
  for (const e of slice) {
    const denom = Math.max(1, e.total);
    sum += e.correct / denom;
  }
  return sum / slice.length;
}

/** `weeksBack` 0 = current week, 1 = previous full week (Mon–Sun local). */
export function averageAccuracyForWeekOffset(
  entries: { at: string; correct: number; total: number }[],
  refDate: Date,
  weeksBack: number
): number | null {
  const start = startOfWeekMondayOffset(refDate, weeksBack);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return averageAccuracyInRange(entries, start, end);
}

/** Monday 00:00 local through `refDate` inclusive (partial current week). */
export function averageAccuracyCurrentWeekPartial(
  entries: { at: string; correct: number; total: number }[],
  refDate: Date = new Date()
): number | null {
  const start = startOfWeekMondayLocal(refDate);
  const tEnd = refDate.getTime();
  const slice = entries.filter((e) => {
    const t = new Date(e.at).getTime();
    return !Number.isNaN(t) && t >= start.getTime() && t <= tEnd;
  });
  if (!slice.length) return null;
  let sum = 0;
  for (const e of slice) {
    const denom = Math.max(1, e.total);
    sum += e.correct / denom;
  }
  return sum / slice.length;
}
