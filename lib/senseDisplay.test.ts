import { describe, expect, it } from "vitest";
import type { SenseSlot } from "./types";
import { meaningChipDisplayLabel, meaningChipHeadAndGloss } from "./senseDisplay";

const mockSense = (partial: Partial<SenseSlot> & Pick<SenseSlot, "meaningTa" | "glossEn">): SenseSlot => ({
  id: "x",
  pos: "Noun",
  sentenceTemplate: "",
  wordForm: "",
  ...partial,
});

describe("meaningChipHeadAndGloss", () => {
  it("uses glossEn in parentheses display", () => {
    const s = mockSense({
      meaningTa: "ஆறு (நதி)",
      glossEn: "river",
    });
    expect(meaningChipHeadAndGloss(s)).toEqual({ head: "ஆறு", gloss: "river" });
    expect(meaningChipDisplayLabel(s)).toBe("ஆறு (river)");
  });

  it("handles meaningTa without parentheses", () => {
    const s = mockSense({ meaningTa: "கற்றல்", glossEn: "to learn" });
    expect(meaningChipDisplayLabel(s)).toBe("கற்றல் (to learn)");
  });
});
