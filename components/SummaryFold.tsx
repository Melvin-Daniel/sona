"use client";

import { useId, useState } from "react";

type Props = {
  kicker?: string;
  title: string;
  /** Shown in the header when collapsed (keep short). */
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  /** e.g. session count badge */
  meta?: React.ReactNode;
  className?: string;
};

/**
 * Collapsible summary block — same visual language as achievements (border-2, rounded-2xl, kicker).
 */
export function SummaryFold({
  kicker,
  title,
  subtitle,
  defaultOpen = false,
  children,
  meta,
  className = "",
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId().replace(/:/g, "");
  const headingId = `lex-fold-h-${uid}`;
  const panelId = `lex-fold-p-${uid}`;

  return (
    <section
      className={`lex-summary-fold overflow-hidden rounded-2xl border-2 border-[color-mix(in_srgb,var(--accent)_22%,var(--border))] bg-[var(--card)] shadow-[0_10px_36px_color-mix(in_srgb,var(--accent)_8%,transparent)] ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] md:p-5"
      >
        <div className="min-w-0 flex-1">
          {kicker ? (
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">{kicker}</p>
          ) : null}
          <h3
            id={headingId}
            className="font-headline mt-0.5 text-xl font-bold tracking-tight text-[var(--text)] md:text-[1.35rem]"
          >
            {title}
          </h3>
          {!open && subtitle ? (
            <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-[color-mix(in_srgb,var(--muted)_40%,var(--text))]">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          {meta}
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--accent)_25%,var(--border))] bg-[color-mix(in_srgb,var(--card-elevated)_80%,var(--accent))] text-sm font-bold text-[var(--accent)] transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▼
          </span>
        </div>
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headingId}
          className="border-t border-[var(--border)] px-4 pb-5 pt-1 md:px-5 md:pb-6"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
