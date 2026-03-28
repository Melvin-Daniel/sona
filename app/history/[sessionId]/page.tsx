"use client";

import { SessionDetailPanel } from "@/components/SessionDetailPanel";
import {
  parseHistoryRaw,
  SESSION_STORAGE_KEY,
  sessionEntryKey,
  type SessionHistoryEntry,
} from "@/lib/sessionHistory";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function HistorySessionPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.sessionId;
  const sessionId = typeof rawId === "string" ? decodeURIComponent(rawId) : "";
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) setHistory(parseHistoryRaw(JSON.parse(raw)));
    } catch {
      setHistory([]);
    }
  }, []);

  const entry = useMemo(
    () => history.find((e) => sessionEntryKey(e) === sessionId),
    [history, sessionId]
  );

  const onPracticeWord = (word: string) => {
    try {
      sessionStorage.setItem("lexifyd_pending_practice", word);
    } catch {
      /* ignore */
    }
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] px-5 py-10 text-[var(--text)] md:px-10 md:py-12 lg:px-14 xl:px-16">
      <nav className="mb-8">
        <Link href="/" className="text-ui font-semibold text-[var(--accent)] hover:underline">
          ← Lexifyd home
        </Link>
      </nav>
      {entry ? (
        <SessionDetailPanel
          entry={entry}
          onBack={() => router.push("/")}
          onPracticeWord={onPracticeWord}
        />
      ) : (
        <div className="lex-card p-8 text-ui leading-relaxed text-[var(--muted)]">
          <p className="font-display text-display-tight font-semibold text-[var(--text)]">Session not found</p>
          <p className="mt-3">It may have been cleared or the link is wrong.</p>
          <Link href="/" className="mt-6 inline-block text-ui font-semibold text-[var(--accent)] hover:underline">
            Return home
          </Link>
        </div>
      )}
    </main>
  );
}
