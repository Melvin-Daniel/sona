"use client";

import { SessionDetailPanel } from "@/components/SessionDetailPanel";
import { SessionSummary } from "@/components/SessionSummary";
import { SummaryFold } from "@/components/SummaryFold";
import { computeHistoryInsights } from "@/lib/insights";
import { loadMastery } from "@/lib/mastery";
import { taxonomyLabel } from "@/lib/taxonomyLabels";
import type { OptionRole } from "@/lib/types";
import { countSessionsThisWeek, DEFAULT_WEEKLY_SESSION_TARGET } from "@/lib/weeklySessions";
import type { DetailedSessionRecord, SessionHistoryEntry } from "@/lib/sessionHistory";
import { detailedRecordToBySense, isDetailedSession, sessionEntryKey } from "@/lib/sessionHistory";

type Props = {
  history: SessionHistoryEntry[];
  lastSession: DetailedSessionRecord | null;
  selectedSessionKey: string | null;
  onSelectSession: (key: string) => void;
  onClearSelection: () => void;
  streakDays: number;
  dailyQualifiedToday: boolean;
  onGoPlay: () => void;
  onPracticeWord: (word: string) => void;
  /** Download session history + progression JSON (backup / judges). */
  onExportHistory?: () => void;
};

function TrendBars({ values }: { values: number[] }) {
  if (!values.length) {
    return <p className="text-ui text-[var(--muted)]">Play more sessions to see a trend.</p>;
  }
  const h = 96;
  return (
    <div className="flex items-end gap-1.5" style={{ height: h }} aria-hidden>
      {values.map((pct, i) => (
        <div
          key={i}
          className="min-w-[8px] flex-1 rounded-t bg-[color-mix(in_srgb,var(--accent)_55%,var(--border))]"
          style={{ height: `${Math.max(8, (pct / 100) * h)}px` }}
          title={`${pct}%`}
        />
      ))}
    </div>
  );
}

export function SummaryDashboard({
  history,
  lastSession,
  selectedSessionKey,
  onSelectSession,
  onClearSelection,
  streakDays,
  dailyQualifiedToday,
  onGoPlay,
  onPracticeWord,
  onExportHistory,
}: Props) {
  const insights = computeHistoryInsights(history, loadMastery());
  const weeklySessions = countSessionsThisWeek(history);
  const weeklyPct = Math.min(
    100,
    Math.round((weeklySessions / DEFAULT_WEEKLY_SESSION_TARGET) * 100)
  );
  const selected = selectedSessionKey
    ? history.find((e) => sessionEntryKey(e) === selectedSessionKey)
    : undefined;

  if (selected) {
    return (
      <SessionDetailPanel
        entry={selected}
        bookmarkHref={`/history/${encodeURIComponent(sessionEntryKey(selected))}`}
        onBack={onClearSelection}
        onPracticeWord={(w) => {
          onPracticeWord(w);
          onClearSelection();
          onGoPlay();
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--text)]">Summary</h2>
        <div className="flex flex-wrap items-center gap-2">
          {onExportHistory && (
            <button type="button" onClick={onExportHistory} className="lex-btn-segment">
              Export history (JSON)
            </button>
          )}
          <button type="button" onClick={onGoPlay} className="lex-btn-primary">
            Continue playing
          </button>
        </div>
      </div>

      <SummaryFold
        kicker="Pulse"
        title="At a glance"
        subtitle="Streak, daily quest, 7-day sessions, and average accuracy."
        defaultOpen
      >
        <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card-elevated)_70%,transparent)] p-4">
            <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">Streak</p>
            <p className="mt-1 font-display text-2xl font-bold text-[var(--accent)] md:text-3xl">{streakDays}d</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card-elevated)_70%,transparent)] p-4">
            <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">Daily quest</p>
            <p className="mt-1 text-ui font-medium text-[var(--text)]">
              {dailyQualifiedToday ? "Done today ✓" : "Not completed today"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card-elevated)_70%,transparent)] p-4">
            <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">Sessions (7 days)</p>
            <p className="mt-1 font-display text-2xl font-bold text-[var(--text)] md:text-3xl">
              {insights.sessionsLast7Days}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card-elevated)_70%,transparent)] p-4">
            <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--muted-2)]">Avg accuracy (logged)</p>
            <p className="mt-1 font-display text-2xl font-bold text-[var(--success)] md:text-3xl">
              {insights.avgAccuracyPct}%
            </p>
          </div>
        </div>
      </SummaryFold>

      <SummaryFold
        kicker="Rhythm"
        title="Weekly practice goal"
        subtitle={`${weeklySessions} / ${DEFAULT_WEEKLY_SESSION_TARGET} sessions this week (Mon–Sun).`}
        defaultOpen
        meta={
          <span className="hidden text-right text-ui font-semibold text-[var(--accent)] sm:block">
            {weeklyPct}%
          </span>
        }
      >
        <div className="pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-ui font-medium text-[var(--accent)]">
              {weeklySessions} / {DEFAULT_WEEKLY_SESSION_TARGET} sessions
            </p>
          </div>
          <p className="mt-2 text-ui-sm text-[var(--muted)]">
            Finish &amp; summary counts once per play-through (this calendar week, Mon–Sun).
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-ui text-[var(--muted)]">
            <span>
              <span className="font-semibold text-[var(--text)]">This week</span> (avg accuracy):{" "}
              {insights.thisWeekAvgAccuracyPct != null ? (
                <span className="tabular-nums text-[var(--accent)]">{insights.thisWeekAvgAccuracyPct}%</span>
              ) : (
                <span className="text-[var(--muted-2)]">—</span>
              )}
            </span>
            <span>
              <span className="font-semibold text-[var(--text)]">Last week</span>:{" "}
              {insights.lastWeekAvgAccuracyPct != null ? (
                <span className="tabular-nums text-[var(--accent)]">{insights.lastWeekAvgAccuracyPct}%</span>
              ) : (
                <span className="text-[var(--muted-2)]">—</span>
              )}
            </span>
          </div>
          <div
            className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--accent-ink)]"
            role="progressbar"
            aria-valuenow={weeklyPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Weekly session goal progress"
          >
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${weeklyPct}%` }}
            />
          </div>
        </div>
      </SummaryFold>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SummaryFold
            kicker="Last play"
            title="Latest session"
            subtitle={
              lastSession
                ? `${lastSession.correct}/${lastSession.total} · ${lastSession.mode === "arcade" ? "Arcade" : lastSession.mode === "boss" ? "Boss" : lastSession.mode === "daily" ? "Daily" : "Custom"}`
                : "Finish a word to see your last summary here."
            }
            defaultOpen
          >
            <div className="pt-2">
              {lastSession ? (
                <SessionSummary
                  embedded
                  total={lastSession.total}
                  correct={lastSession.correct}
                  {...detailedRecordToBySense(lastSession)}
                  runLabel={
                    lastSession.mode === "arcade"
                      ? "Arcade"
                      : lastSession.mode === "boss"
                        ? "Boss"
                        : lastSession.mode === "daily"
                          ? "Daily quest"
                          : "Custom"
                  }
                />
              ) : (
                <p className="text-ui leading-relaxed text-[var(--muted)]">
                  Finish a word and tap <strong className="text-[var(--text)]">Finish &amp; summary</strong> to
                  populate this section.
                </p>
              )}
            </div>
          </SummaryFold>
        </div>

        <div className="space-y-4 lg:col-span-5">
          <SummaryFold
            kicker="Trend"
            title="Accuracy trend"
            subtitle={`Last ${insights.trendAccuracyPct.length} sessions — bar heights show score %.`}
          >
            <div className="pt-2">
              <p className="text-ui-sm text-[var(--muted-2)]">Last {insights.trendAccuracyPct.length} sessions</p>
              <div className="mt-3">
                <TrendBars values={insights.trendAccuracyPct} />
              </div>
            </div>
          </SummaryFold>

          {insights.distractorBreakdown.length > 0 && (
            <SummaryFold
              kicker="Diagnostics"
              title="Where mistakes come from"
              subtitle="Tagged distractor roles from sessions with round detail."
            >
              <div className="pt-2">
                <p className="text-ui-sm text-[var(--muted-2)]">From sessions with round detail</p>
                <ul className="mt-3 space-y-2 text-ui">
                  {insights.distractorBreakdown.slice(0, 6).map((d) => (
                    <li key={d.role} className="flex justify-between gap-2 text-[var(--muted)]">
                      <span className="text-[var(--text)]">{taxonomyLabel(d.role as OptionRole)}</span>
                      <span className="tabular-nums text-[var(--accent)]">{d.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SummaryFold>
          )}
        </div>
      </div>

      <SummaryFold
        kicker="Mastery"
        title="Words by volume"
        subtitle="Per-lemma accuracy and how many times you finished each word on this device."
      >
        <div className="pt-2">
          <p className="text-ui-sm text-[var(--muted-2)]">
            Round accuracy × sessions on this device (includes all finished play-throughs, not only the list below).
          </p>
          {insights.wordAccuracyBars.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {insights.wordAccuracyBars.map((row) => (
                <li key={row.word}>
                  <div className="flex justify-between gap-2 text-ui">
                    <span className="font-tamil text-[var(--text)]">{row.word}</span>
                    <span className="tabular-nums text-[var(--muted)]">
                      {row.pct}% · {row.plays} session{row.plays === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--accent-ink)]">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-ui text-[var(--muted)]">
              Finish at least one word challenge to see per-lemma accuracy here. Stats are stored locally in your
              browser.
            </p>
          )}
        </div>
      </SummaryFold>

      {insights.weakWithWhy.length > 0 && (
        <SummaryFold
          kicker="Focus"
          title="Weak spots — why"
          subtitle={`${insights.weakWithWhy.length} word${insights.weakWithWhy.length === 1 ? "" : "s"} with coaching lines from your recent misses.`}
          meta={
            <span className="rounded-full bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-2.5 py-1 text-[11px] font-bold text-[var(--danger)]">
              {insights.weakWithWhy.length}
            </span>
          }
        >
          <ul className="space-y-2.5 pt-2 text-ui text-[var(--muted)]">
            {insights.weakWithWhy.map((w) => (
              <li
                key={w.word}
                className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card-elevated)_55%,transparent)] px-3 py-2.5"
              >
                <span className="font-tamil text-base font-medium text-[var(--text)]">{w.word}</span>
                <span className="mt-1 block text-ui-sm leading-relaxed">{w.line}</span>
              </li>
            ))}
          </ul>
        </SummaryFold>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SummaryFold
            kicker="Coach"
            title="Coach (offline)"
            subtitle="Device-only tips from your history — expand when you want a nudge."
          >
            <ul className="space-y-2.5 pt-2 text-ui text-[var(--muted)]">
              {insights.tips.map((t, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--card-elevated)_60%,transparent)] px-3 py-2.5 leading-relaxed"
                >
                  {t}
                </li>
              ))}
            </ul>
          </SummaryFold>
        </div>
        <div className="lg:col-span-5">
          {(insights.weakWords.length > 0 || insights.strongWords.length > 0) && (
            <SummaryFold
              kicker="Queue"
              title="Review & strong"
              subtitle="Words to revisit next vs. lemmas you are nailing lately."
            >
              <div className="grid gap-4 pt-2 sm:grid-cols-1">
                {insights.weakWords.length > 0 && (
                  <div>
                    <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--danger)]">
                      Review next
                    </p>
                    <p className="mt-1.5 font-tamil text-base text-[var(--text)]">{insights.weakWords.join(" · ")}</p>
                  </div>
                )}
                {insights.strongWords.length > 0 && (
                  <div>
                    <p className="text-ui-sm font-semibold uppercase tracking-wide text-[var(--success)]">
                      Strong lately
                    </p>
                    <p className="mt-1.5 font-tamil text-base text-[var(--text)]">
                      {insights.strongWords.join(" · ")}
                    </p>
                  </div>
                )}
              </div>
            </SummaryFold>
          )}
        </div>
      </div>

      <SummaryFold
        kicker="History"
        title="Recent sessions"
        subtitle={
          history.length
            ? `${history.length} session${history.length === 1 ? "" : "s"} — tap a row for detail.`
            : "No sessions logged yet."
        }
        meta={
          history.length > 0 ? (
            <span className="rounded-full bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-2.5 py-1 text-[11px] font-bold text-[var(--accent)]">
              {history.length}
            </span>
          ) : null
        }
      >
        <p className="pt-2 text-ui-sm leading-relaxed text-[var(--muted-2)]">
          Tap a row for mistakes, sentences, and corrections.
        </p>
        {history.length === 0 ? (
          <p className="mt-3 text-ui text-[var(--muted)]">No sessions logged yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--border)] text-ui">
            {history.map((h) => {
              const key = sessionEntryKey(h);
              const pct = h.total ? Math.round((h.correct / h.total) * 100) : 0;
              const perfect = h.correct === h.total && h.total > 0;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => onSelectSession(key)}
                    className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--card-elevated)_40%,transparent)]"
                  >
                    <span className="flex flex-wrap items-center gap-2 font-tamil text-base text-[var(--text)] md:text-lg">
                      {h.word}
                      {perfect && (
                        <span className="rounded-md bg-[color-mix(in_srgb,var(--success)_18%,transparent)] px-2 py-0.5 text-ui-sm font-semibold uppercase text-[var(--success)]">
                          Perfect
                        </span>
                      )}
                      {isDetailedSession(h) && (
                        <span className="rounded-md border border-[var(--border)] px-2 py-0.5 text-ui-sm text-[var(--muted)]">
                          Detail
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 text-sm text-[var(--muted)] md:gap-3">
                      <span className="hidden w-20 sm:block">
                        <span
                          className="block h-1.5 overflow-hidden rounded-full bg-[var(--accent-ink)]"
                          title={`${pct}%`}
                        >
                          <span className="block h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                        </span>
                      </span>
                      <span className="tabular-nums">
                        {h.correct}/{h.total} · {new Date(h.at).toLocaleString()}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </SummaryFold>
    </div>
  );
}
