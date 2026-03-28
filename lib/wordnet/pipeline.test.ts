import { describe, expect, it } from "vitest";
import { listSeedWords } from "../seed";
import { listCustomPlayWords } from "./pipeline";

describe("listCustomPlayWords", () => {
  it("includes all seed lemmas and sorts Tamil locale", () => {
    const list = listCustomPlayWords();
    const seeds = listSeedWords();
    for (const w of seeds) {
      expect(list).toContain(w);
    }
    const sorted = [...list].sort((a, b) => a.localeCompare(b, "ta"));
    expect(list).toEqual(sorted);
  });
});
