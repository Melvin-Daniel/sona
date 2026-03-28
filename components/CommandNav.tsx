"use client";

import { MAIN_NAV, type AppTabId } from "@/lib/mainNav";

type Props = {
  active: AppTabId;
  onChange: (id: AppTabId) => void;
};

export function CommandNav({ active, onChange }: Props) {
  return (
    <nav className="flex flex-col gap-1.5" aria-label="Command centre">
      <p className="mb-3 px-1 text-ui-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted-2)]">
        Navigate
      </p>
      {MAIN_NAV.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          title={t.hint}
          className={`lex-nav-item ${active === t.id ? "lex-nav-item-active" : ""}`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
