import type { SenseSlot } from "./types";

/** Tamil head (text before first "(") and optional English gloss. */
export function meaningChipHeadAndGloss(s: SenseSlot): { head: string; gloss: string | null } {
  const raw = s.meaningTa.trim();
  const head = raw.match(/^([^(]+)/)?.[1]?.trim() ?? raw;
  const g = s.glossEn.trim();
  return { head, gloss: g || null };
}

/**
 * Single string for graph labels etc.: Tamil head + English gloss in parentheses.
 * Drag/drop identity stays `meaningTa`; this is display-only.
 */
export function meaningChipDisplayLabel(s: SenseSlot): string {
  const { head, gloss } = meaningChipHeadAndGloss(s);
  return gloss ? `${head} (${gloss})` : head;
}
