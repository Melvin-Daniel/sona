import { describe, expect, it } from "vitest";
import { getSeed, listSeedWords } from "./seed";

describe("seed data", () => {
  it("lists multiple words", () => {
    const words = listSeedWords();
    expect(words.length).toBeGreaterThanOrEqual(10);
  });

  it("getSeed returns pipeline for படி", () => {
    const s = getSeed("படி");
    expect(s).not.toBeNull();
    expect(s!.senses.length).toBeGreaterThanOrEqual(3);
    expect(s!.rounds.length).toBeGreaterThanOrEqual(3);
  });

  it("getSeed returns null for unknown word", () => {
    expect(getSeed("not-a-real-seed-word-xyz")).toBeNull();
  });
});
