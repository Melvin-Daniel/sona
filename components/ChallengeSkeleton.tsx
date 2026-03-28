"use client";

export function ChallengeSkeleton() {
  return (
    <div className="lex-card animate-pulse space-y-4 p-6" aria-hidden>
      <div className="h-4 w-32 rounded bg-[color-mix(in_srgb,var(--border)_95%,transparent)]" />
      <div className="h-24 rounded-lg bg-[color-mix(in_srgb,var(--card-elevated)_70%,transparent)]" />
      <div className="flex flex-wrap gap-2">
        <div className="h-11 w-28 rounded-lg bg-[color-mix(in_srgb,var(--border)_85%,transparent)]" />
        <div className="h-11 w-32 rounded-lg bg-[color-mix(in_srgb,var(--border)_85%,transparent)]" />
        <div className="h-11 w-24 rounded-lg bg-[color-mix(in_srgb,var(--border)_85%,transparent)]" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-[color-mix(in_srgb,var(--card-elevated)_65%,transparent)]" />
        ))}
      </div>
      <p className="text-center text-xs text-[var(--muted)]">Generating challenge…</p>
    </div>
  );
}
