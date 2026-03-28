import { describe, expect, it } from "vitest";
import { listSeedWords } from "./seed";
import { tamilToTanglish } from "./tanglish";

describe("tamilToTanglish", () => {
  it("handles common lemmas", () => {
    expect(tamilToTanglish("படி")).toBe("padi");
    expect(tamilToTanglish("கல்")).toBe("kal");
    expect(tamilToTanglish("ஆறு")).toBe("aaru");
    expect(tamilToTanglish("கை")).toBe("kai");
    expect(tamilToTanglish("சொல்")).toBe("sol");
  });

  it("produces non-empty Tanglish for every seed lemma (or is covered by hints)", () => {
    for (const w of listSeedWords()) {
      const t = tamilToTanglish(w);
      expect(t.length, `empty translit for ${w}`).toBeGreaterThan(0);
    }
  });
});
