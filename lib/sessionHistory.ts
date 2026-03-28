import type { LexifydGameMode } from "@/lib/types";

export type SessionRoundHow = "mcq" | "drag" | "timeout";

/** One committed round outcome (after learner locks an answer or times out). */
export type SessionRoundLog = {
  senseId: string;
  senseLabel: string;
  sentence: string;
  correct: boolean;
  how: SessionRoundHow;
  correctIndex: number;
  correctText: string;
  pickedIndex?: number;
  pickedText?: string;
  /** OptionRole / distractor taxonomy for wrong MCQ pick */
  pickedRole?: string;
  explainWrongTa?: string | null;
  explainWrongEn?: string | null;
};

export type DetailedSessionRecord = {
  v: 2;
  id: string;
  at: string;
  word: string;
  mode?: LexifydGameMode;
  correct: number;
  total: number;
  rounds: SessionRoundLog[];
};

/** Pre–v2 rows stored in localStorage */
export type LegacySessionRow = {
  at: string;
  word: string;
  correct: number;
  total: number;
};

export type SessionHistoryEntry = DetailedSessionRecord | LegacySessionRow;

export const SESSION_STORAGE_KEY = "lexifyd_sessions";

export function isDetailedSession(e: SessionHistoryEntry): e is DetailedSessionRecord {
  return typeof e === "object" && e !== null && "v" in e && (e as DetailedSessionRecord).v === 2;
}

export function sessionEntryKey(e: SessionHistoryEntry): string {
  if (isDetailedSession(e)) return e.id;
  return `legacy__${e.at}__${e.word}`;
}

export function sessionAccuracy(e: SessionHistoryEntry): number {
  const t = Math.max(1, e.total);
  return e.correct / t;
}

export function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function parseHistoryRaw(raw: unknown): SessionHistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(Boolean).map((row) => {
    if (typeof row === "object" && row !== null && "v" in row && (row as { v: number }).v === 2) {
      return row as DetailedSessionRecord;
    }
    return row as LegacySessionRow;
  });
}

export function detailedRecordToBySense(
  r: DetailedSessionRecord
): { bySense: Record<string, boolean>; senseLabels: Record<string, string> } {
  const bySense: Record<string, boolean> = {};
  const senseLabels: Record<string, string> = {};
  for (const round of r.rounds) {
    bySense[round.senseId] = round.correct;
    senseLabels[round.senseId] = round.senseLabel;
  }
  return { bySense, senseLabels };
}
