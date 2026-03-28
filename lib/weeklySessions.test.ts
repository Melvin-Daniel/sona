import { describe, expect, it } from "vitest";
import {
  averageAccuracyForWeekOffset,
  averageAccuracyCurrentWeekPartial,
  countSessionsThisWeek,
  DEFAULT_WEEKLY_SESSION_TARGET,
} from "./weeklySessions";

describe("countSessionsThisWeek", () => {
  it("counts entries on and after Monday of ref week (local)", () => {
    const sun = new Date(2026, 2, 22, 15, 0, 0);
    const mon = new Date(2026, 2, 23, 15, 0, 0);
    const tue = new Date(2026, 2, 24, 15, 0, 0);
    const ref = mon;
    const list = [
      { at: sun.toISOString() },
      { at: mon.toISOString() },
      { at: tue.toISOString() },
    ];
    const n = countSessionsThisWeek(list, ref);
    expect(n).toBe(2);
  });
});

describe("DEFAULT_WEEKLY_SESSION_TARGET", () => {
  it("is 5", () => {
    expect(DEFAULT_WEEKLY_SESSION_TARGET).toBe(5);
  });
});

describe("averageAccuracyForWeekOffset", () => {
  it("averages sessions in the previous Mon–Sun week (local)", () => {
    const ref = new Date(2026, 2, 25, 12, 0, 0);
    const prevSun = new Date(2026, 2, 22, 15, 0, 0);
    const entries = [{ at: prevSun.toISOString(), correct: 1, total: 2 }];
    const avg = averageAccuracyForWeekOffset(entries, ref, 1);
    expect(avg).toBeCloseTo(0.5, 5);
  });
});

describe("averageAccuracyCurrentWeekPartial", () => {
  it("includes entries from Monday through refDate only", () => {
    const ref = new Date(2026, 2, 25, 12, 0, 0);
    const thisWed = new Date(2026, 2, 25, 10, 0, 0);
    const prevSun = new Date(2026, 2, 22, 10, 0, 0);
    const entries = [
      { at: thisWed.toISOString(), correct: 1, total: 1 },
      { at: prevSun.toISOString(), correct: 0, total: 1 },
    ];
    const avg = averageAccuracyCurrentWeekPartial(entries, ref);
    expect(avg).toBe(1);
  });
});
