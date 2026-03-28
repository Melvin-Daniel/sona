import { describe, expect, it } from "vitest";
import {
  applyAdaptivePressureSec,
  arcadePressureSeconds,
  BOSS_TIMER_SEC,
  nextPressureDelta,
} from "./runModes";

describe("runModes adaptive pressure", () => {
  it("arcade tightens more on correct than boss", () => {
    expect(nextPressureDelta("arcade", 0, true)).toBe(-5);
    expect(nextPressureDelta("boss", 0, true)).toBe(-2);
  });

  it("arcade recovers more on miss than boss", () => {
    expect(nextPressureDelta("arcade", 0, false)).toBe(8);
    expect(nextPressureDelta("boss", 0, false)).toBe(3);
  });

  it("applyAdaptivePressureSec uses stricter absolute bounds for boss", () => {
    const generousArcade = applyAdaptivePressureSec("arcade", arcadePressureSeconds(0), 22);
    expect(generousArcade).toBe(56);
    const strictBoss = applyAdaptivePressureSec("boss", BOSS_TIMER_SEC, 6);
    expect(strictBoss).toBe(38);
    const bossFloor = applyAdaptivePressureSec("boss", BOSS_TIMER_SEC, -8);
    expect(bossFloor).toBe(24);
  });
});
