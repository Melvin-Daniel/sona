import { describe, expect, it } from "vitest";
import { newSessionId } from "./sessionHistory";
import { computeHistoryInsights, mergeReviewQueueWords } from "./insights";

describe("computeHistoryInsights", () => {
  it("returns defaults for empty history", () => {
    const i = computeHistoryInsights([]);
    expect(i.sessionCount).toBe(0);
    expect(i.avgAccuracyPct).toBe(0);
    expect(i.tips.length).toBeGreaterThan(0);
    expect(i.weakWords).toEqual([]);
  });

  it("computes avg accuracy and weak words", () => {
    const entries = [
      { at: "2026-01-01T00:00:00.000Z", word: "அ", correct: 0, total: 2 },
      { at: "2026-01-02T00:00:00.000Z", word: "அ", correct: 1, total: 2 },
      { at: "2026-01-03T00:00:00.000Z", word: "ஆ", correct: 2, total: 2 },
    ];
    const i = computeHistoryInsights(entries);
    expect(i.sessionCount).toBe(3);
    expect(i.avgAccuracyPct).toBeGreaterThan(0);
    expect(i.weakWords).toContain("அ");
  });

  it("fills wordAccuracyBars from mastery when provided", () => {
    const mastery = {
      படி: {
        plays: 3,
        correctRounds: 6,
        totalRounds: 9,
        lastPlayed: "2026-01-01T00:00:00.000Z",
      },
    };
    const i = computeHistoryInsights([], mastery);
    expect(i.wordAccuracyBars.length).toBe(1);
    expect(i.wordAccuracyBars[0]).toMatchObject({ word: "படி", pct: 67, plays: 3 });
  });

  it("weak spots explain untagged wrong rounds", () => {
    const id = newSessionId();
    const entries = [
      {
        v: 2 as const,
        id,
        at: "2026-01-05T00:00:00.000Z",
        word: "ஆறு",
        mode: "custom" as const,
        correct: 0,
        total: 2,
        rounds: [
          {
            senseId: "a",
            senseLabel: "river",
            sentence: "x",
            correct: false,
            how: "timeout" as const,
            correctIndex: 0,
            correctText: "y",
          },
        ],
      },
      { at: "2026-01-06T00:00:00.000Z", word: "ஆறு", correct: 0, total: 2 },
    ];
    const i = computeHistoryInsights(entries, {});
    const w = i.weakWithWhy.find((x) => x.word === "ஆறு");
    expect(w).toBeDefined();
    expect(w!.line).toContain("incorrect round");
    expect(w!.line).toContain("MCQ");
  });

  it("prefers mastery bars over history slice when both exist", () => {
    const mastery = {
      கல்: {
        plays: 2,
        correctRounds: 3,
        totalRounds: 4,
        lastPlayed: "",
      },
    };
    const entries = [
      { at: "2026-01-01T00:00:00.000Z", word: "அ", correct: 1, total: 2 },
    ];
    const i = computeHistoryInsights(entries, mastery);
    expect(i.wordAccuracyBars.some((b) => b.word === "கல்")).toBe(true);
    expect(i.wordAccuracyBars.some((b) => b.word === "அ")).toBe(false);
  });

  it("exposes this-week and last-week avg accuracy when entries fall in those ranges", () => {
    const ref = new Date(2026, 2, 25, 12, 0, 0);
    const thisMon = new Date(2026, 2, 23, 10, 0, 0);
    const prevSun = new Date(2026, 2, 22, 10, 0, 0);
    const entries = [
      { at: thisMon.toISOString(), word: "அ", correct: 1, total: 2 },
      { at: prevSun.toISOString(), word: "ஆ", correct: 2, total: 2 },
    ];
    const i = computeHistoryInsights(entries);
    expect(i.thisWeekAvgAccuracyPct).toBe(50);
    expect(i.lastWeekAvgAccuracyPct).toBe(100);
  });
});

describe("mergeReviewQueueWords", () => {
  it("prefers overlap between mastery-weak and insight-weak (mastery order), then fills from each list", () => {
    const out = mergeReviewQueueWords(["b", "a", "c"], ["x", "a", "b"], 4);
    expect(out).toEqual(["b", "a", "c", "x"]);
  });

  it("respects limit", () => {
    expect(mergeReviewQueueWords(["a", "b"], ["c", "d"], 2)).toEqual(["a", "b"]);
  });
});
