import { describe, expect, it } from "vitest";
import {
  parseHistoryRaw,
  sessionEntryKey,
  sessionAccuracy,
  type DetailedSessionRecord,
} from "./sessionHistory";

describe("parseHistoryRaw", () => {
  it("returns [] for non-array", () => {
    expect(parseHistoryRaw(null)).toEqual([]);
    expect(parseHistoryRaw({})).toEqual([]);
  });
  it("parses legacy rows", () => {
    const raw = [{ at: "2026-01-01T00:00:00.000Z", word: "படி", correct: 1, total: 2 }];
    const out = parseHistoryRaw(raw);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ word: "படி", correct: 1, total: 2 });
  });
  it("parses v2 detailed rows", () => {
    const row: DetailedSessionRecord = {
      v: 2,
      id: "abc",
      at: "2026-01-02T00:00:00.000Z",
      word: "கல்",
      correct: 2,
      total: 2,
      rounds: [],
    };
    const out = parseHistoryRaw([row]);
    expect(out[0]).toEqual(row);
  });
});

describe("sessionEntryKey", () => {
  it("uses id for detailed sessions", () => {
    expect(
      sessionEntryKey({
        v: 2,
        id: "uuid-1",
        at: "x",
        word: "w",
        correct: 0,
        total: 1,
        rounds: [],
      })
    ).toBe("uuid-1");
  });
  it("uses legacy key shape", () => {
    expect(
      sessionEntryKey({
        at: "2026-03-01T12:00:00.000Z",
        word: "தீ",
        correct: 1,
        total: 2,
      })
    ).toBe("legacy__2026-03-01T12:00:00.000Z__தீ");
  });
});

describe("sessionAccuracy", () => {
  it("divides correct by total", () => {
    expect(sessionAccuracy({ at: "", word: "", correct: 3, total: 4 })).toBe(0.75);
  });
  it("avoids divide by zero", () => {
    expect(sessionAccuracy({ at: "", word: "", correct: 0, total: 0 })).toBe(0);
  });
});
