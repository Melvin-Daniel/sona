import type { DetailedSessionRecord, SessionHistoryEntry } from "@/lib/sessionHistory";
import { isDetailedSession } from "@/lib/sessionHistory";

export type ActivityRow = {
  id: string;
  kind: "ok" | "bad" | "badge";
  word: string;
  detail: string;
  timeLabel: string;
};

function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}

/** Last sessions → mockup-style “Recent activity” (per-round when detailed). */
export function recentActivityFromHistory(entries: SessionHistoryEntry[], limit = 6): ActivityRow[] {
  const out: ActivityRow[] = [];
  const pushRoundRows = (e: DetailedSessionRecord) => {
    const rounds = [...e.rounds].reverse();
    for (const r of rounds) {
      if (out.length >= limit) return;
      const gloss = r.senseLabel.replace(/\s*\([^)]*\)\s*$/, "").trim();
      out.push({
        id: `${e.id}_${r.senseId}`,
        kind: r.correct ? "ok" : "bad",
        word: e.word,
        detail: r.correct
          ? `identified as ${gloss} · +12 XP`
          : r.correctText
            ? `missed — correct was “${r.correctText.slice(0, 48)}${r.correctText.length > 48 ? "…" : ""}”`
            : "missed — review the sense",
        timeLabel: formatRelativeTime(e.at),
      });
    }
  };

  for (const e of entries) {
    if (out.length >= limit) break;
    if (isDetailedSession(e)) {
      pushRoundRows(e);
    } else {
      const acc = e.total > 0 ? Math.round((e.correct / e.total) * 100) : 0;
      out.push({
        id: `legacy_${e.at}_${e.word}`,
        kind: e.correct === e.total && e.total > 0 ? "ok" : "bad",
        word: e.word,
        detail: `${e.correct}/${e.total} correct (${acc}%)`,
        timeLabel: formatRelativeTime(e.at),
      });
    }
  }
  if (out.length === 0) {
    out.push({
      id: "empty",
      kind: "ok",
      word: "Lexifyd",
      detail: "Play a round — activity will appear here.",
      timeLabel: "—",
    });
  }
  return out;
}
